import useImport from '@/hooks/use-import'
import useWebsiteSetting from '@/hooks/use-website-setting'
import React from 'react'

export default function Logo() {
    const { settings } = useWebsiteSetting()
    const { appearance } = useImport()
    console.log(settings)
    return (
        <div>
            <img src={settings?.logo || undefined} alt={settings?.title_ar || undefined} />
        </div>
    )
}
