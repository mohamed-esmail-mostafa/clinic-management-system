
import React from 'react';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useImport from '@/hooks/use-import';

interface PaginationLink {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
}

export default function Pagination({
    links,
    from,
    to,
    total,
}: PaginationProps) {
    const { t, isRtl } = useImport()
    if (!links || links.length <= 3) {
        return null;
    }

    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        url: string | null,
    ) => {
        e.preventDefault();

        if (!url) return;

        router.visit(url, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };




    return (
        <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
            {/* Results info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                {from && to && total ? (
                    <>
                        {t('common.showing')} {' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                            {from}
                        </span>{' '}
                        {t('common.to')}{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                            {to}
                        </span>{' '}
                        {t('common.of')}{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                            {total}
                        </span>{' '}
                        {t('common.results')}
                    </>
                ) : null}
            </div>

            {/* Pagination */}
            <nav className="flex items-center gap-1" aria-label="Pagination">
                {links.map((link, index) => {
                    const isPrevious = index === 0;
                    const isNext = index === links.length - 1;
                    const isEllipsis = link.label === '...';

                    if (isEllipsis) {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="flex h-9 min-w-9 items-center justify-center px-2 text-sm text-gray-500"
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <a
                            key={`${link.page}-${index}`}
                            href={link.url ?? '#'}
                            onClick={(e) => handleClick(e, link.url)}
                            aria-current={link.active ? 'page' : undefined}
                            className={`
                                inline-flex h-9 min-w-9 items-center justify-center rounded-md
                                px-3 text-sm font-medium transition
                                ${link.active
                                    ? 'bg-primary text-white'
                                    : link.url
                                        ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                        : 'cursor-not-allowed text-gray-400'
                                }
                            `}
                        >
                            {isPrevious ? (
                                <>
                                     {isRtl ?  <ChevronRight className="h-4 w-4" />: <ChevronLeft className="h-4 w-4" /> }
                                    <span className="hidden sm:inline">
                                        {t('common.previous')}

                                    </span>
                                </>
                            ) : isNext ? (
                                <>
                                    <span className="hidden sm:inline">

                                        {t('common.next')}
                                    </span>
                                    {/* <ChevronRight className="h-4 w-4" /> */}
                                    {isRtl ?  <ChevronLeft className="h-4 w-4" />: <ChevronRight className="h-4 w-4" /> }
                                </>
                            ) : (
                                link.label
                            )}
                        </a>
                    );
                })}
            </nav>
        </div>
    );
}
