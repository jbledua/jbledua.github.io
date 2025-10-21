// Plain text resume layout wrapped in an MUI Paper for visual framing; content remains plain text.
import Paper from '@mui/material/Paper';
export default function PlainResume(props) {
    const {
        loading,
        state,
        NAME,
        summaryFormat,
        printRef,
        experiencesToShow = [],
        projectsToShow = [],
        skillsToShow = [],
        educationToShow = [],
        certificatesToShow = [],
    } = props;

    const divider = () => '--------\n';

    const formatUrlDisplay = (url) => {
        try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, '');
        const path = u.pathname.replace(/\/+$/, '');
        return `${host}${path}` || host;
        } catch {
        return String(url)
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/+$/, '');
        }
    };

    const lines = [];

    // Header
    lines.push(NAME || '');
    lines.push(divider());

    // Contact
    lines.push('Contact');
    if (loading) {
        lines.push('Loading contact...');
    } else {
        const contacts = (state?.accounts || [])
        .filter((a) => a && (a.url || a.requiresAuth))
        .map((a) => ({
            label: a.label || a.name,
            text: a.url ? formatUrlDisplay(a.url) : (a.requiresAuth ? 'Available upon request' : ''),
        }));
        if (contacts.length === 0) {
        lines.push('No contact information.');
        } else {
        contacts.forEach((c) => {
            lines.push(`${c.label}: ${c.text}`);
        });
        }
    }

    lines.push('');
    lines.push(divider());

    // Summary
    lines.push('Summary');
    if (loading) {
        lines.push('Loading summary...');
    } else if (summaryFormat === 'both') {
        const hasP = Array.isArray(state.summaryParagraphs) && state.summaryParagraphs.length > 0;
        const hasB = Array.isArray(state.summaryLines) && state.summaryLines.length > 0;
        if (!hasP && !hasB) {
        lines.push('No summary provided.');
        } else {
        if (hasP) {
            state.summaryParagraphs.forEach((p) => {
            lines.push(p);
            lines.push('');
            });
        }
        if (hasB) {
            state.summaryLines.forEach((s) => lines.push(`- ${s}`));
        }
        }
    } else if (summaryFormat === 'paragraph') {
        const hasP = Array.isArray(state.summaryParagraphs) && state.summaryParagraphs.length > 0;
        if (hasP) {
        state.summaryParagraphs.forEach((p) => {
            lines.push(p);
            lines.push('');
        });
        } else {
        lines.push('No summary provided.');
        }
    } else {
        const hasB = Array.isArray(state.summaryLines) && state.summaryLines.length > 0;
        if (hasB) {
        state.summaryLines.forEach((s) => lines.push(`- ${s}`));
        } else {
        lines.push('No summary provided.');
        }
    }

    lines.push('');
    lines.push(divider());

    // Experience
    lines.push('Experience');
    if (loading) {
        lines.push('Loading experience...');
    } else if (!experiencesToShow.length) {
        lines.push('No experience to display.');
    } else {
        experiencesToShow.forEach((e) => {
        const v = e.variants[e.selectedVariant] || e.variants[0] || {};
        const meta = [v.period, v.location].filter(Boolean).join(' · ');
        lines.push(v.title || '');
        if (meta) lines.push(meta);
        if (v.summary) lines.push(v.summary);
        if (Array.isArray(v.bullets) && v.bullets.length) {
            v.bullets.forEach((b) => lines.push(`- ${b}`));
        }
        lines.push('');
        });
    }

    lines.push(divider());

    // Projects
    lines.push('Projects');
    if (loading) {
        lines.push('Loading projects...');
    } else if (!projectsToShow.length) {
        lines.push('No projects to display.');
    } else {
        projectsToShow.forEach((p) => {
        lines.push(p.label || '');
        if (p.url) lines.push(formatUrlDisplay(p.url));
        const desc = p.description || (Array.isArray(p.paragraphs) ? p.paragraphs[0] : '');
        if (desc) lines.push(desc);
        lines.push('');
        });
    }

    lines.push(divider());

  // Skills
    lines.push('Skills');
    if (loading) {
        lines.push('Loading skills...');
    } else if (!skillsToShow.length) {
        lines.push('No skills to display.');
    } else {
        skillsToShow.forEach(({ group, items }) => {
        lines.push(`${group}: ${items.map((i) => i.label).join(', ')}`);
        });
    }

    // Education
    if (educationToShow.length) {
        lines.push('');
        lines.push(divider());
        lines.push('Education');
        educationToShow.forEach((e) => {
        lines.push(e.label || '');
        const detail = [e.degree, e.field].filter(Boolean).join(', ');
        const meta = `${detail}${(detail && e.period) ? ' · ' : ''}${e.period || ''}`.trim();
        if (meta) lines.push(meta);
        if (e.summary) lines.push(e.summary);
        if (Array.isArray(e.bullets) && e.bullets.length) {
            e.bullets.forEach((b) => lines.push(`- ${b}`));
        }
        lines.push('');
        });
    }

    // Certificates
    if (certificatesToShow.length) {
        lines.push(divider());
        lines.push('Certificates');
        certificatesToShow.forEach((c) => {
        lines.push(c.label || '');
        const meta = [c.issuer, c.period].filter(Boolean).join(' · ');
        if (meta) lines.push(meta);
        if (c.credentialUrl) lines.push(`Credential: ${c.credentialUrl}`);
        if (c.summary) lines.push(c.summary);
        lines.push('');
        });
    }

    const content = lines.join('\n');

  // Keep IDs for print CSS compatibility; wrap in Paper for card-like presentation
    return (
        <Paper
        id="resume-paper"
        elevation={1}
        variant="outlined"
        sx={{ p: 2, maxWidth: '8.5in', mx: 'auto', backgroundColor: 'background.paper' }}
        >
        <div id="resume-print-area" ref={printRef}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0 }}>{content}</pre>
        </div>
        </Paper>
    );
}
