import React, { useState, useRef, DragEvent } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import useImport from '@/hooks/use-import'

interface ImageUploadProps {
    label: string
    id: string
    required?: boolean
    accept?: string
    onChange: (file: File | null) => void
    disabled?: boolean
    className?: string
    previewClassName?: string
    error?: string
    initialPreview?: string | null
}

export default function ImagePicker({
    label,
    id,
    required = false,
    accept = 'image/*',
    onChange,
    disabled = false,
    className,
    previewClassName,
    error,
    initialPreview = null,
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(initialPreview)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { t } = useImport()

    React.useEffect(() => {
        setPreview(initialPreview)
    }, [initialPreview])

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            onChange(file)
        } else {
            setPreview(null)
            onChange(null)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        handleFileChange(file)
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) {
            setIsDragging(true)
        }
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return

        const file = e.dataTransfer.files?.[0] || null
        handleFileChange(file)
    }

    const handleRemove = () => {
        setPreview(null)
        onChange(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click()
        }
    }

    return (
        <div className={cn('grid gap-2', className)}>
            <Label htmlFor={id}>
                {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <div
                className={cn(
                    'relative border-2 border-dashed rounded-lg transition-all duration-200',
                    isDragging && 'border-primary bg-primary/5',
                    !isDragging && 'border-gray-300 dark:border-gray-700',
                    disabled && 'opacity-50 cursor-not-allowed',
                    !disabled && 'cursor-pointer hover:border-primary/50',
                    error && 'border-red-500'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    id={id}
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="hidden"
                    required={required && !preview}
                />

                {preview ? (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className={cn(
                                'w-full h-48 object-cover rounded-lg',
                                previewClassName
                            )}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClick()
                                }}
                                disabled={disabled}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {t('common.change')}
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemove()
                                }}
                                disabled={disabled}
                            >
                                <X className="w-4 h-4 mr-2" />
                                {t('common.remove')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <ImageIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">

                                {t('common.upload-image')}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('common.file-size-limit')}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4 bg-main hover:bg-second"
                            disabled={disabled}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleClick()
                            }}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {t('common.choose-file')}
                        </Button>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
            )}
        </div>
    )
}
