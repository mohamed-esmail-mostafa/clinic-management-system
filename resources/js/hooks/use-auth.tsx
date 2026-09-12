import { usePage } from '@inertiajs/react'
import React from 'react'

export default function useAuth() {
  const { auth } = usePage().props
  return {
    auth
  }
}
