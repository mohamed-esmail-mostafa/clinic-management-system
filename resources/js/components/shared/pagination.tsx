
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
    const { t, isRtl } = useImport();

    if (!links?.length || !total) {
        return null;
    }

    /*
     * Laravel pagination structure:
     *
     * links[0]           = Previous
     * links[1...n-1]     = Pages
     * links[n]           = Next
     */
    const previousLink = links[0];
    const nextLink = links[links.length - 1];

    const pageLinks = links.slice(1, -1).filter(
        (link) => link.page !== null,
    );

    const currentPage =
        pageLinks.find((link) => link.active)?.page ?? 1;

    const lastPage =
        pageLinks
            .map((link) => link.page ?? 0)
            .reduce((max, page) => Math.max(max, page), 1);

    /*
     * Show a maximum of 5 pages:
     *
     * Current page in middle:
     * 3 4 [5] 6 7
     *
     * Near beginning:
     * [1] 2 3 4 5
     *
     * Near end:
     * 6 7 8 9 [10]
     */
    const maxVisiblePages = 5;

    let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2),
    );

    let endPage = Math.min(
        lastPage,
        startPage + maxVisiblePages - 1,
    );

    // Shift window back when we're near the last page.
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(
            1,
            endPage - maxVisiblePages + 1,
        );
    }

    const visiblePages = pageLinks.filter(
        (link) =>
            link.page !== null &&
            link.page >= startPage &&
            link.page <= endPage,
    );

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

    const renderArrow = (direction: 'previous' | 'next') => {
        const isPrevious = direction === 'previous';

        const icon = isPrevious
            ? isRtl
                ? <ChevronRight className="h-4 w-4" />
                : <ChevronLeft className="h-4 w-4" />
            : isRtl
                ? <ChevronLeft className="h-4 w-4" />
                : <ChevronRight className="h-4 w-4" />;

        return (
            <>
                {icon}

                <span className="hidden sm:inline">
                    {isPrevious
                        ? t('common.previous')
                        : t('common.next')}
                </span>
            </>
        );
    };

    return (
        <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
            {/* Results */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                {from !== undefined &&
                to !== undefined &&
                total !== undefined ? (
                    <>
                        {t('common.showing')}{' '}
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
            {lastPage > 1 && (
                <nav
                    className="flex items-center gap-1"
                    aria-label="Pagination"
                >
                    {/* Previous */}
                    <a
                        href={previousLink?.url ?? '#'}
                        onClick={(e) =>
                            handleClick(e, previousLink?.url ?? null)
                        }
                        aria-disabled={!previousLink?.url}
                        className={`
                            inline-flex h-9 items-center justify-center gap-1
                            rounded-md px-2.5 text-sm font-medium
                            transition-colors sm:px-3
                            ${
                                previousLink?.url
                                    ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                    : 'pointer-events-none cursor-not-allowed text-gray-300 dark:text-gray-700'
                            }
                        `}
                    >
                        {renderArrow('previous')}
                    </a>

                    {/* Pages */}
                    {visiblePages.map((link) => (
                        <a
                            key={link.page}
                            href={link.url ?? '#'}
                            onClick={(e) =>
                                handleClick(e, link.url)
                            }
                            aria-current={
                                link.active ? 'page' : undefined
                            }
                            className={`
                                inline-flex h-9 min-w-9 items-center
                                justify-center rounded-md px-2.5
                                text-sm font-medium transition-colors
                                ${
                                    link.active
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                }
                            `}
                        >
                            {link.label}
                        </a>
                    ))}

                    {/* Next */}
                    <a
                        href={nextLink?.url ?? '#'}
                        onClick={(e) =>
                            handleClick(e, nextLink?.url ?? null)
                        }
                        aria-disabled={!nextLink?.url}
                        className={`
                            inline-flex h-9 items-center justify-center gap-1
                            rounded-md px-2.5 text-sm font-medium
                            transition-colors sm:px-3
                            ${
                                nextLink?.url
                                    ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                    : 'pointer-events-none cursor-not-allowed text-gray-300 dark:text-gray-700'
                            }
                        `}
                    >
                        {renderArrow('next')}
                    </a>
                </nav>
            )}
        </div>
    );
}
