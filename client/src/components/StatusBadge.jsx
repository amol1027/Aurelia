/**
 * StatusBadge - Displays adoption application status with color coding
 */
export default function StatusBadge({ status }) {
    const statusConfig = {
        pending: {
            label: 'Pending',
            bgColor: 'bg-primary-50',
            textColor: 'text-primary-700',
            borderColor: 'border-primary-200'
        },
        under_review: {
            label: 'Under Review',
            bgColor: 'bg-accent-50',
            textColor: 'text-accent-700',
            borderColor: 'border-accent-200'
        },
        approved: {
            label: 'Approved',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700',
            borderColor: 'border-green-200'
        },
        rejected: {
            label: 'Rejected',
            bgColor: 'bg-red-50',
            textColor: 'text-red-700',
            borderColor: 'border-red-200'
        },
        completed: {
            label: 'Completed',
            bgColor: 'bg-accent-100',
            textColor: 'text-accent-800',
            borderColor: 'border-accent-300'
        },
        withdrawn: {
            label: 'Withdrawn',
            bgColor: 'bg-warm-bg',
            textColor: 'text-warm-muted',
            borderColor: 'border-warm-border'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
        >
            {config.label}
        </span>
    );
}
