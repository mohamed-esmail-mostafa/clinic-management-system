import React from 'react'
import useAuth from './use-auth'

export default function useAuthClinics() {
    const {auth}=useAuth();
    const clinics = auth?.user.clinics
  return {
    clinics
  }
}
