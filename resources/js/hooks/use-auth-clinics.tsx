import React from 'react'
import useAuth from './use-auth'

export default function useAuthClinics() {
  const { auth } = useAuth();
  const clinics = auth?.user?.clinics ?? []
  const authClinic = clinics[0] ?? null
  return {
    clinics,
    authClinic
  }
}
