import React from 'react'
import { Button } from '../ui/button'
import useImport from '@/hooks/use-import'
import {ArrowRight,ArrowLeft} from 'lucide-react'

export default function BackBtn() {
    const { t, isRtl } = useImport()
    return (
        <Button onClick={()=>history.back()} variant="outline" className="gap-2 shadow-xs">
            {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t('common.go_back')}
        </Button>
    )
}
