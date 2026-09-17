import useImport from '@/hooks/use-import'
import useWebsiteSetting from '@/hooks/use-website-setting'
import React from 'react'

export default function Logo() {
    const { settings } = useWebsiteSetting()
    const { appearance } = useImport()
    const isDark = appearance === 'dark'

    return (
        <div>
            <img className='w-16 h-16' src={isDark ? settings?.dark_logo ?? null : settings?.logo ?? null} alt={settings?.title_ar || undefined} />
        </div>
    )
}
