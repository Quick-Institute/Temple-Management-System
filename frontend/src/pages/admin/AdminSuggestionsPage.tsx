import { useEffect, useState } from 'react';
import type { Suggestion } from '../SuggestionsPage';
import { Link } from 'react-router-dom';

type SuggestionStatus = 'Pending' | 'Approved' | 'Rejected';
type FilterStatus = 'All' | SuggestionStatus;

export default function AdminSuggestionsPage() {
const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
const [filter, setFilter] = useState<FilterStatus>('All');

// Load suggestions from localStorage
const load = () => {
    try {
        const data: unknown = JSON.parse(
            localStorage.getItem('temple_suggestions') || '[]'
        );

        if (!Array.isArray(data)) {
            setSuggestions([]);
            return;
        }

        setSuggestions(
            [...data as Suggestion[]].reverse()
        );

    } catch (error) {
        console.error('Unable to load suggestions:', error);
        setSuggestions([]);
    }
};

// Load suggestions when page opens
useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    load();
}, []);

// Update suggestion status
const updateStatus = (
    id: string,
    status: SuggestionStatus
) => {
    try {
        const all: Suggestion[] = JSON.parse(
            localStorage.getItem('temple_suggestions') || '[]'
        );

        const updated = all.map((suggestion) =>
            suggestion.id === id
                ? { ...suggestion, status }
                : suggestion
        );

        localStorage.setItem(
            'temple_suggestions',
            JSON.stringify(updated)
        );

        load();

    } catch (error) {
        console.error('Unable to update suggestion:', error);
        alert('Unable to update suggestion status.');
    }
};

// Calculate dashboard counts
const totalCount = suggestions.length;
const pendingCount = suggestions.filter(s => s.status === 'Pending').length;
const approvedCount = suggestions.filter(s => s.status === 'Approved').length;
const rejectedCount = suggestions.filter(s => s.status === 'Rejected').length;

// Filter suggestions
const filtered = filter === 'All'
    ? suggestions
    : suggestions.filter(
        suggestion => suggestion.status === filter
    );

// Filter button style
const filterButtonStyle = (status: FilterStatus): React.CSSProperties => ({
    padding: '10px 17px',
    borderRadius: '8px',
    border: filter === status ? '1px solid #18382D' : '1px solid #E2E5DF',
    background: filter === status ? '#18382D' : '#FFFFFF',
    color: filter === status ? '#FFFFFF' : '#526057',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
});

// Status badge style
const getStatusStyle = (status: SuggestionStatus): React.CSSProperties => {
    const styles = {
        Pending: {
            background: '#FFF3D6',
            color: '#956B13',
        },
        Approved: {
            background: '#E5F4E9',
            color: '#267044',
        },
        Rejected: {
            background: '#FCE8E7',
            color: '#B42318',
        },
    };

    return {
        ...styles[status],
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
    };
};

// Dashboard summary card
const summaryCard = (
    title: string,
    count: number,
    description: string,
    accent: string,
    icon: string
) => (
    <div style={{
        background: '#FFFFFF',
        border: '1px solid #EAE7DC',
        borderRadius: '13px',
        padding: '22px',
        boxShadow: '0 5px 18px rgba(0,0,0,0.03)',
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '17px',
        }}>
            <span style={{
                color: '#68756B',
                fontSize: '13px',
                fontWeight: 'bold',
            }}>
                {title}
            </span>

            <span style={{
                background: accent + '18',
                color: accent,
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                fontSize: '19px',
            }}>
                {icon}
            </span>
        </div>

        <h2 style={{
            color: '#18382D',
            fontSize: '30px',
            margin: '0 0 5px',
        }}>
            {count}
        </h2>

        <p style={{
            color: '#929A92',
            fontSize: '12px',
            margin: '0',
        }}>
            {description}
        </p>
    </div>
);

return (
    <div style={{
        minHeight: '100vh',
        background: '#F8F7F2',
        padding: '45px 20px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
    }}>

        <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
        }}>

            {/* Dashboard Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
                marginBottom: '30px',
            }}>

                <div>
                    <div style={{
                        color: '#A0803F',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        letterSpacing: '1.5px',
                        marginBottom: '10px',
                    }}>
                        TEMPLE ADMINISTRATION
                    </div>

                    <h1 style={{
                        color: '#18382D',
                        fontSize: '30px',
                        margin: '0 0 9px',
                    }}>
                        Community Suggestions
                    </h1>

                    <p style={{
                        color: '#78847B',
                        fontSize: '14px',
                        margin: '0',
                    }}>
                        Review and manage ideas submitted by the community.
                    </p>
                </div>

                <Link
                    to="/suggestions"
                    style={{
                        background: '#18382D',
                        color: '#FFFFFF',
                        padding: '12px 18px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 'bold',
                    }}
                >
                    View Submission Page →
                </Link>

            </div>

            {/* Dashboard Summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '17px',
                marginBottom: '35px',
            }}>

                {summaryCard(
                    'Total Suggestions',
                    totalCount,
                    'All submitted suggestions',
                    '#18382D',
                    '▤'
                )}

                {summaryCard(
                    'Pending Review',
                    pendingCount,
                    'Waiting for admin review',
                    '#C28B22',
                    '◷'
                )}

                {summaryCard(
                    'Approved',
                    approvedCount,
                    'Accepted suggestions',
                    '#267044',
                    '✓'
                )}

                {summaryCard(
                    'Rejected',
                    rejectedCount,
                    'Declined suggestions',
                    '#C2413A',
                    '✕'
                )}

            </div>

            {/* Suggestions Section */}
            <div style={{
                background: '#FFFFFF',
                border: '1px solid #EAE7DC',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.03)',
            }}>

                <div style={{
                    marginBottom: '22px',
                }}>
                    <h2 style={{
                        color: '#18382D',
                        fontSize: '20px',
                        margin: '0 0 7px',
                    }}>
                        Submitted Suggestions
                    </h2>

                    <p style={{
                        color: '#89938B',
                        fontSize: '13px',
                        margin: '0',
                    }}>
                        Review community feedback and update its status.
                    </p>
                </div>

                {/* Filter Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '9px',
                    flexWrap: 'wrap',
                    marginBottom: '25px',
                }}>

                    <button
                        onClick={() => setFilter('All')}
                        style={filterButtonStyle('All')}
                    >
                        All ({totalCount})
                    </button>

                    <button
                        onClick={() => setFilter('Pending')}
                        style={filterButtonStyle('Pending')}
                    >
                        Pending ({pendingCount})
                    </button>

                    <button
                        onClick={() => setFilter('Approved')}
                        style={filterButtonStyle('Approved')}
                    >
                        Approved ({approvedCount})
                    </button>

                    <button
                        onClick={() => setFilter('Rejected')}
                        style={filterButtonStyle('Rejected')}
                    >
                        Rejected ({rejectedCount})
                    </button>

                </div>

                {/* Empty State */}
                {filtered.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '55px 20px',
                        background: '#FAFAF7',
                        borderRadius: '12px',
                        border: '1px dashed #DDE2DA',
                    }}>
                        <div style={{
                            fontSize: '35px',
                            marginBottom: '12px',
                        }}>
                            ▤
                        </div>

                        <h3 style={{
                            color: '#34483B',
                            fontSize: '17px',
                            marginBottom: '8px',
                        }}>
                            No Suggestions Found
                        </h3>

                        <p style={{
                            color: '#929A92',
                            fontSize: '13px',
                            margin: '0',
                        }}>
                            There are no suggestions in this category yet.
                        </p>
                    </div>
                )}

                {/* Suggestions List */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                }}>

                    {filtered.map((s) => (
                        <div
                            key={s.id}
                            style={{
                                border: '1px solid #E8EBE5',
                                borderRadius: '12px',
                                padding: '22px',
                                background: '#FFFFFF',
                            }}
                        >

                            {/* Suggestion Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '15px',
                                flexWrap: 'wrap',
                            }}>

                                <div>
                                    <h3 style={{
                                        color: '#18382D',
                                        fontSize: '17px',
                                        margin: '0 0 8px',
                                    }}>
                                        {s.name}
                                    </h3>

                                    <span style={{
                                        background: '#F0E8D5',
                                        color: '#92702F',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                    }}>
                                        {s.category}
                                    </span>
                                </div>

                                <span style={getStatusStyle(s.status)}>
                                    {s.status}
                                </span>

                            </div>

                            {/* Suggestion Metadata */}
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '15px',
                                marginTop: '17px',
                                marginBottom: '17px',
                                color: '#89938B',
                                fontSize: '12px',
                            }}>
                                <span>
                                    📅 {new Date(s.date).toLocaleString()}
                                </span>

                                <span>
                                    ID: {s.id}
                                </span>
                            </div>

                            {/* Suggestion Text */}
                            <div style={{
                                background: '#F8F7F2',
                                padding: '17px',
                                borderRadius: '9px',
                                marginBottom: '15px',
                            }}>
                                <p style={{
                                    color: '#455349',
                                    fontSize: '14px',
                                    lineHeight: '1.7',
                                    margin: '0',
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {s.text}
                                </p>
                            </div>

                            {/* Submitter Information */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px',
                            }}>

                                <div style={{
                                    color: '#89938B',
                                    fontSize: '12px',
                                }}>
                                    {s.anonymous
                                        ? 'Submitted anonymously'
                                        : s.email || 'No email provided'}
                                </div>

                                {/* Admin Actions */}
                                {s.status === 'Pending' && (
                                    <div style={{
                                        display: 'flex',
                                        gap: '9px',
                                    }}>

                                        <button
                                            onClick={() => updateStatus(s.id, 'Approved')}
                                            style={{
                                                background: '#267044',
                                                color: '#FFFFFF',
                                                padding: '9px 17px',
                                                border: 'none',
                                                borderRadius: '7px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ✓ Approve
                                        </button>

                                        <button
                                            onClick={() => updateStatus(s.id, 'Rejected')}
                                            style={{
                                                background: '#C2413A',
                                                color: '#FFFFFF',
                                                padding: '9px 17px',
                                                border: 'none',
                                                borderRadius: '7px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ✕ Reject
                                        </button>

                                    </div>
                                )}

                            </div>

                        </div>
                    ))}

                </div>

            </div>

            {/* Footer */}
            <p style={{
                textAlign: 'center',
                color: '#9AA39C',
                fontSize: '12px',
                marginTop: '25px',
            }}>
                Temple Management System | Community Suggestions Management
            </p>

        </div>
    </div>
);


}
