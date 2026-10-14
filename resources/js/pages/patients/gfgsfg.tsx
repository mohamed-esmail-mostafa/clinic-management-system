 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patientList.map((patient) => {
                            const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.full_name || t('patients.unnamed', 'Unnamed Patient');
                            return (
                                <Card
                                    key={patient.id}
                                    className="group border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-primary/40 dark:hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden"
                                >
                                    <CardContent className="p-5 space-y-4">
                                        {/* Header: Avatar, Name, Number, Status Switch & Actions Menu */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-11 w-11 bg-primary/10 text-primary border border-primary/20 font-bold shrink-0">
                                                    <AvatarFallback>{getInitials(patient.first_name, patient.last_name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingPatient(patient)}
                                                        className="font-bold text-gray-900 dark:text-white text-base hover:text-primary transition-colors text-start truncate block max-w-[180px] sm:max-w-[200px]"
                                                        title={fullName}
                                                    >
                                                        {fullName}
                                                    </button>
                                                    <span className="text-xs text-primary font-mono font-medium block">
                                                        {patient.patient_number}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Switch
                                                    checked={patient.is_active}
                                                    onCheckedChange={() => handleToggleStatus(patient)}
                                                    title={patient.is_active ? t('patients.active', 'Active') : t('patients.inactive', 'Inactive')}
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/clinic/${authClinic?.slug}/patients/${patient.id}/visits`}
                                                                className="flex items-center gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
                                                            >
                                                                <Stethoscope className="h-4 w-4" />
                                                                {t('visits.title', 'Patient Visits')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setViewingPatient(patient)}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                            {t('patients.view', 'View Details')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/clinic/${authClinic?.slug}/patients/${patient.id}/edit`}
                                                                className="flex items-center gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                {t('patients.edit', 'Edit Patient')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingPatient(patient)}
                                                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 font-medium"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            {t('patients.delete', 'Delete Patient')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Quick Badges row */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                            <Badge
                                                className={
                                                    patient.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 text-[11px] font-medium'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[11px] font-medium'
                                                }
                                            >
                                                {patient.is_active ? t('patients.active', 'Active') : t('patients.inactive', 'Inactive')}
                                            </Badge>

                                            {patient.gender && (
                                                <Badge variant="outline" className="capitalize text-[11px] font-normal">
                                                    {t(`patients.${patient.gender}`, patient.gender)}
                                                </Badge>
                                            )}

                                            {patient.blood_type && (
                                                <Badge className="bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 font-bold text-[11px]">
                                                    {patient.blood_type}
                                                </Badge>
                                            )}

                                            {patient.marital_status && (
                                                <Badge variant="secondary" className="capitalize text-[11px] font-normal">
                                                    {t(`patients.${patient.marital_status}`, patient.marital_status)}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/80 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <div>
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                                                    {t('patients.phone', 'Phone')}
                                                </span>
                                                {patient.phone ? (
                                                    <a
                                                        href={`tel:${patient.phone}`}
                                                        className="font-medium text-gray-800 dark:text-gray-200 hover:text-primary flex items-center gap-1 mt-0.5 truncate"
                                                        dir="ltr"
                                                    >
                                                        <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                                                        <span>{patient.phone}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 mt-0.5 block">-</span>
                                                )}
                                            </div>

                                            <div>
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                                                    {t('patients.date_of_birth', 'Date of Birth')}
                                                </span>
                                                <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5 truncate">
                                                    <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
                                                    <span>{patient.date_of_birth || '-'}</span>
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                                                    {t('patients.address', 'Address')}
                                                </span>
                                                <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 mt-0.5 truncate">
                                                    {patient.address ? (
                                                        <>
                                                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                                                            <span className="truncate">{patient.address}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bottom Quick Card Actions */}
                                        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 gap-2">
                                            <Link
                                                href={`/clinic/${authClinic?.slug}/patients/${patient.id}/visits`}
                                                className="flex-1"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 gap-1.5 h-8 cursor-pointer"
                                                >
                                                    <Stethoscope className="h-3.5 w-3.5" />
                                                    {t('visits.title', 'Visits')}
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setViewingPatient(patient)}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1 h-8 px-2.5 cursor-pointer"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                {t('patients.view', 'View')}
                                            </Button>

                                            {/* <Link href={`/clinic/${clinicSlug}/patients/${patient.id}/edit`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 gap-1 h-8 px-2.5 cursor-pointer"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    {t('common.edit', 'Edit')}
                                                </Button>
                                            </Link> */}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}





                    </div>