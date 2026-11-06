import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

export interface Suggestion {
    id: string;
    name: string;
    email: string;
    category: string;
    text: string;
    anonymous: boolean;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export default function SuggestionsPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('Temple Maintenance');
    const [text, setText] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!text.trim()) {
            alert('Please enter your suggestion.');
            return;
        }

        if (!anonymous && !name.trim()) {
            alert('Please enter your name or select anonymous submission.');
            return;
        }

        const newSuggestion: Suggestion = {
            id: 'SUG-' + Date.now(),
            name: anonymous ? 'Anonymous' : name.trim(),
            email: anonymous ? '' : email.trim(),
            category,
            text: text.trim(),
            anonymous,
            date: new Date().toISOString(),
            status: 'Pending',
        };

        try {
            const existing = JSON.parse(
                localStorage.getItem('temple_suggestions') || '[]'
            );

            if (!Array.isArray(existing)) {
                throw new Error('Invalid suggestions data');
            }

            existing.push(newSuggestion);

            localStorage.setItem(
                'temple_suggestions',
                JSON.stringify(existing)
            );

            setDone(true);
            setName('');
            setEmail('');
            setText('');
            setCategory('Temple Maintenance');
            setAnonymous(false);

        } catch (error) {
            console.error('Suggestion submission failed:', error);
            alert('Unable to save your suggestion. Please try again.');
        }
    };

    // Success Screen
    if (done) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#F8F7F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px 20px',
                fontFamily: 'Arial, sans-serif',
            }}>
                <div style={{
                    background: '#FFFFFF',
                    width: '100%',
                    maxWidth: '520px',
                    padding: '45px 35px',
                    borderRadius: '18px',
                    textAlign: 'center',
                    boxShadow: '0 10px 35px rgba(0,0,0,0.07)',
                    border: '1px solid #EAE7DC',
                }}>

                    <div style={{
                        width: '75px',
                        height: '75px',
                        background: '#E8F3EA',
                        color: '#267044',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '38px',
                        margin: '0 auto 22px',
                    }}>
                        ✓
                    </div>

                    <h2 style={{
                        color: '#18382D',
                        fontSize: '27px',
                        marginBottom: '12px',
                    }}>
                        Thank You!
                    </h2>

                    <p style={{
                        color: '#647067',
                        fontSize: '15px',
                        lineHeight: '1.7',
                        marginBottom: '28px',
                    }}>
                        Your suggestion has been successfully submitted.
                        Our temple administration will review your idea.
                    </p>

                    <button
                        onClick={() => setDone(false)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#18382D',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '9px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginBottom: '15px',
                        }}
                    >
                        Submit Another Suggestion
                    </button>

                    <Link
                        to="/admin/suggestions"
                        style={{
                            display: 'inline-block',
                            color: '#9B7936',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                        }}
                    >
                        Go to Admin Review Page →
                    </Link>

                </div>
            </div>
        );
    }

    // Main Suggestions Form
    return (
        <div style={{
            minHeight: '100vh',
            background: '#F8F7F2',
            padding: '55px 20px',
            fontFamily: 'Arial, sans-serif',
            boxSizing: 'border-box',
        }}>

            <div style={{
                maxWidth: '720px',
                margin: '0 auto',
            }}>

                {/* Page Heading */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '35px',
                }}>

                    <div style={{
                        display: 'inline-block',
                        background: '#F0E8D5',
                        color: '#92702F',
                        padding: '7px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        marginBottom: '16px',
                    }}>
                        COMMUNITY PARTICIPATION
                    </div>

                    <h1 style={{
                        color: '#18382D',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        margin: '0 0 12px',
                    }}>
                        Ideas & Suggestions
                    </h1>

                    <p style={{
                        color: '#69736C',
                        fontSize: '15px',
                        lineHeight: '1.7',
                        margin: '0',
                    }}>
                        Your ideas can help us improve our temple and
                        strengthen our community.
                    </p>

                </div>

                {/* Form Card */}
                <div style={{
                    background: '#FFFFFF',
                    padding: '35px',
                    borderRadius: '16px',
                    border: '1px solid #EAE7DC',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                }}>

                    <h2 style={{
                        color: '#18382D',
                        fontSize: '20px',
                        margin: '0 0 8px',
                    }}>
                        Share Your Thoughts
                    </h2>

                    <p style={{
                        color: '#849087',
                        fontSize: '13px',
                        marginBottom: '28px',
                    }}>
                        Please complete the form below to submit your idea.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                        }}
                    >

                        {/* Anonymous Option */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: '#F8F7F2',
                            padding: '15px',
                            borderRadius: '9px',
                            border: '1px solid #EAE7DC',
                            color: '#34483B',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}>
                            <input
                                type="checkbox"
                                checked={anonymous}
                                onChange={e => setAnonymous(e.target.checked)}
                                style={{
                                    width: '17px',
                                    height: '17px',
                                    accentColor: '#18382D',
                                    cursor: 'pointer',
                                }}
                            />
                            <span style={{ fontWeight: 'bold' }}>
                                Submit as Anonymous
                            </span>
                        </label>

                        {/* User Information */}
                        {!anonymous && (
                            <>
                                <div>
                                    <label style={labelStyle}>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                            </>
                        )}

                        {/* Category */}
                        <div>
                            <label style={labelStyle}>
                                Suggestion Category
                            </label>

                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="Temple Maintenance">
                                    Temple Maintenance
                                </option>

                                <option value="Event Idea">
                                    Event Idea
                                </option>

                                <option value="Religious Activity">
                                    Religious Activity
                                </option>

                                <option value="Community Service">
                                    Community Service
                                </option>

                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </div>

                        {/* Suggestion Description */}
                        <div>
                            <label style={labelStyle}>
                                Your Suggestion
                            </label>

                            <textarea
                                placeholder="Describe your idea or suggestion here..."
                                value={text}
                                onChange={e => setText(e.target.value)}
                                rows={6}
                                required
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    minHeight: '130px',
                                    lineHeight: '1.6',
                                }}
                            />

                            <p style={{
                                color: '#9AA39C',
                                fontSize: '12px',
                                textAlign: 'right',
                                marginTop: '6px',
                            }}>
                                Share your ideas clearly with us.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            style={{
                                padding: '15px',
                                background: '#18382D',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '9px',
                                fontSize: '15px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                        >
                            Submit Suggestion →
                        </button>

                    </form>

                </div>

                {/* Footer Note */}
                <p style={{
                    textAlign: 'center',
                    color: '#929A92',
                    fontSize: '12px',
                    marginTop: '25px',
                    lineHeight: '1.6',
                }}>
                    Your contribution matters. Together, we can build a
                    better temple community.
                </p>

            </div>
        </div>
    );
}

// Reusable Input Styles
const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#34483B',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '9px',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px',
    border: '1px solid #DDE2DA',
    borderRadius: '8px',
    background: '#FFFFFF',
    color: '#26372D',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
};