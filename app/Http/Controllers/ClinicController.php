<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddClinicUserRequest;
use App\Http\Requests\StoreClinicRequest;
use App\Http\Requests\UpdateClinicRequest;
use App\Models\Booking;
use App\Models\Clinic;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\User;
use App\Models\Visit;
use App\Services\CityService;
use App\Services\ClinicService;
use App\Services\ClinicTypeService;
use App\Services\CountryService;
use App\Services\GovernorateService;
use App\Services\RoleService;
use App\Services\SpecialtyService;
use App\Services\UserService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClinicController extends Controller
{
    public function __construct(
        protected ClinicService $clinicService,
        protected CountryService $countryService,
        protected GovernorateService $governorateService,
        protected CityService $cityService,
        protected SpecialtyService $specialtyService,
        protected UserService $userService,
        protected RoleService $roleService,
        protected ClinicTypeService $clinicTypeService
    ) {}

    public function index(): Response
    {
        return Inertia::render('clinics/index', [
            'clinics' => $this->clinicService->getAllClinics(),
            'countries' => $this->countryService->getAllCountries(),
            'governorates' => $this->governorateService->getAllGovernorates(),
            'cities' => $this->cityService->getAllCities(),
            'specialties' => $this->specialtyService->getAllSpecialties(),
            'clinic_types' => $this->clinicTypeService->getAllClinicTypes(),
            'all_users' => $this->userService->getAllUsers(),
            'roles' => $this->roleService->getAllRoles(),
        ]);
    }

    public function create_clinic_page(): Response
    {
        return Inertia::render('clinics/create', [
            'countries' => $this->countryService->getAllCountries(),
            'governorates' => $this->governorateService->getAllGovernorates(),
            'cities' => $this->cityService->getAllCities(),
            'specialties' => $this->specialtyService->getAllSpecialties(),
            'clinic_types' => $this->clinicTypeService->getAllClinicTypes(),
        ]);
    }

    public function store_clinic(StoreClinicRequest $request): RedirectResponse
    {
        $this->clinicService->createClinic($request->validated(), $request->user());

        return redirect()->route('admin.clinics.index')->with('success', 'Clinic created successfully');
    }

    public function update(UpdateClinicRequest $request, Clinic $clinic): RedirectResponse
    {
        $this->clinicService->updateClinic($clinic, $request->validated());

        return redirect()->back()->with('success', 'Clinic updated successfully');
    }

    public function destroy(Clinic $clinic): RedirectResponse
    {
        $this->clinicService->deleteClinic($clinic);

        return redirect()->back()->with('success', 'Clinic deleted successfully');
    }

    public function toggleStatus(Clinic $clinic): RedirectResponse
    {
        $this->clinicService->toggleClinicStatus($clinic);

        return redirect()->back()->with('success', 'Clinic status updated successfully');
    }

    public function addUser(AddClinicUserRequest $request, Clinic $clinic): RedirectResponse
    {
        $data = $request->validated();
        $mode = $data['mode'] ?? 'existing';
        $roleId = (int) $data['role_id'];

        if ($mode === 'new') {
            $user = $this->userService->createUser([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'phone' => $data['phone'] ?? null,
                'role_id' => $roleId,
            ]);
            $userId = $user->id;
        } else {
            $userId = (int) $data['user_id'];
        }

        $this->clinicService->addUserToClinic($clinic, $userId, $roleId);

        return redirect()->back()->with('success', 'User added to clinic successfully');
    }

    public function removeUser(Clinic $clinic, User $user): RedirectResponse
    {
        $this->clinicService->removeUserFromClinic($clinic, $user->id);

        return redirect()->back()->with('success', 'User removed from clinic successfully');
    }

    public function clinic_dashboard(Request $request): Response
    {
        $user = $request->user();

        $clinic = null;
        if ($request->filled('clinic')) {
            $clinic = Clinic::where('slug', $request->query('clinic'))->first();
        }
        if (! $clinic && $user) {
            $clinic = $user->clinics()->first();
        }
        if (! $clinic) {
            $clinic = Clinic::first();
        }

        if (! $clinic) {
            return Inertia::render('clinics/overview', [
                'clinic' => null,
                'stats' => [
                    'total_patients' => 0,
                    'new_patients_this_month' => 0,
                    'todays_bookings' => 0,
                    'todays_confirmed_bookings' => 0,
                    'total_bookings' => 0,
                    'total_visits' => 0,
                    'visits_this_month' => 0,
                    'active_medications' => 0,
                ],
                'visits_chart' => [],
                'booking_statuses' => [
                    'confirmed' => 0,
                    'pending' => 0,
                    'completed' => 0,
                    'cancelled' => 0,
                ],
                'todays_appointments' => [],
                'recent_visits' => [],
            ]);
        }

        $clinicId = $clinic->id;
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Key stats
        $totalPatients = Patient::where('clinic_id', $clinicId)->count();
        $newPatientsThisMonth = Patient::where('clinic_id', $clinicId)
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        $todaysBookings = Booking::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $today)
            ->count();
        $todaysConfirmedBookings = Booking::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $today)
            ->where('status', 'confirmed')
            ->count();
        $totalBookings = Booking::where('clinic_id', $clinicId)->count();

        $totalVisits = Visit::where('clinic_id', $clinicId)->count();
        $visitsThisMonth = Visit::where('clinic_id', $clinicId)
            ->where('visited_at', '>=', $startOfMonth)
            ->count();

        $activeMedications = Medication::where('clinic_id', $clinicId)
            ->where('is_active', true)
            ->count();

        // Chart: Visits per day over the last 14 days
        $startDate = Carbon::today()->subDays(13);
        $visitsRaw = Visit::where('clinic_id', $clinicId)
            ->whereDate('visited_at', '>=', $startDate)
            ->whereDate('visited_at', '<=', $today)
            ->get(['visited_at', 'type']);

        $visitsChart = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $dayVisits = $visitsRaw->filter(function ($v) use ($dateStr) {
                return Carbon::parse($v->visited_at)->format('Y-m-d') === $dateStr;
            });

            $visitsChart[] = [
                'date' => $dateStr,
                'day' => $date->format('D'),
                'label' => $date->format('M d'),
                'visits' => $dayVisits->count(),
                'examinations' => $dayVisits->where('type', 'examination')->count(),
                'follow_ups' => $dayVisits->where('type', 'follow_up')->count(),
            ];
        }

        // Booking statuses distribution
        $bookingStatuses = [
            'confirmed' => Booking::where('clinic_id', $clinicId)->where('status', 'confirmed')->count(),
            'pending' => Booking::where('clinic_id', $clinicId)->where('status', 'pending')->count(),
            'completed' => Booking::where('clinic_id', $clinicId)->where('status', 'completed')->count(),
            'cancelled' => Booking::where('clinic_id', $clinicId)->where('status', 'cancelled')->count(),
        ];

        // Today's appointments (up to 6)
        $todaysAppointments = Booking::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $today)
            ->with(['patient:id,first_name,last_name,phone', 'doctor:id,name'])
            ->orderBy('appointment_time', 'asc')
            ->take(6)
            ->get();

        // Recent visits (up to 5)
        $recentVisits = Visit::where('clinic_id', $clinicId)
            ->with('patient:id,first_name,last_name,patient_number,phone')
            ->orderBy('visited_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('clinics/overview', [
            'clinic' => $clinic,
            'stats' => [
                'total_patients' => $totalPatients,
                'new_patients_this_month' => $newPatientsThisMonth,
                'todays_bookings' => $todaysBookings,
                'todays_confirmed_bookings' => $todaysConfirmedBookings,
                'total_bookings' => $totalBookings,
                'total_visits' => $totalVisits,
                'visits_this_month' => $visitsThisMonth,
                'active_medications' => $activeMedications,
            ],
            'visits_chart' => $visitsChart,
            'booking_statuses' => $bookingStatuses,
            'todays_appointments' => $todaysAppointments,
            'recent_visits' => $recentVisits,
        ]);
    }
}
