import { usePage } from '@inertiajs/react'


export default function useWebsiteSetting() {
    const {settings}=usePage().props 
  return {
    settings
  }
}
