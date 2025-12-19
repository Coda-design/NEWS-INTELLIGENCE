// reportsData is provided by data.js

document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    loadReports();
});

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('sv-SE', options);
}

async function loadReports() {
    try {
        const data = reportsData;
        const system = typeof systemData !== 'undefined' ? systemData : { sources: [], internal_docs: [], reports_count: 0 };

        const list = document.getElementById('report-list');
        const docsEl = document.getElementById('stats-docs');
        const sourcesEl = document.getElementById('stats-sources');
        const modelText = document.getElementById('active-model-text');

        // Update Header Info
        if (modelText) modelText.innerText = system.model || "Gemini-3";
        if (docsEl) docsEl.innerText = system.internal_docs ? system.internal_docs.length : 0;
        if (sourcesEl) sourcesEl.innerText = system.sources.length;

        // Render Archive list
        list.innerHTML = '';
        data.forEach((report, index) => {
            const item = document.createElement('li');
            item.className = `report-item ${index === 0 ? 'active' : ''}`;
            item.innerText = report.date;
            item.onclick = () => displayReport(report, item);
            list.appendChild(item);
        });

        if (data.length > 0) {
            displayReport(data[0]);
        }
    } catch (e) {
        console.error("Kunde inte ladda rapporter", e);
    }
}

function displayReport(report, element) {
    if (element) {
        document.querySelectorAll('.report-item').forEach(i => i.classList.remove('active'));
        element.classList.add('active');
    }

    const content = report.content;
    const hasSections = content.includes('# SECTION:');

    if (!hasSections) {
        document.getElementById('section-analysis').innerHTML = marked.parse(content);
        document.getElementById('section-ideas').innerHTML = "<p style='opacity:0.5'>Finns endast i nya rapporter.</p>";
        document.getElementById('section-plan').innerHTML = "<p style='opacity:0.5'>Finns endast i nya rapporter.</p>";
        document.getElementById('section-pitches').innerHTML = "<p style='opacity:0.5'>Finns endast i nya rapporter.</p>";
    } else {
        const getSection = (name) => {
            const regex = new RegExp(`# SECTION: ${name}([\\s\\S]*?)(?=# SECTION:|$)`, 'i');
            const match = content.match(regex);
            return match ? match[1].trim() : "Ingen data tillgänglig för denna sektion.";
        };

        const sections = {
            analysis: getSection('OMVÄRLDSANALYS'),
            ideas: getSection('INNEHÅLLSIDÉER'),
            plan: getSection('PUBLICERINGSPLAN'),
            pitches: getSection('FÖRSLAG PÅ PITCHAR')
        };

        document.getElementById('section-analysis').innerHTML = marked.parse(sections.analysis);
        document.getElementById('section-ideas').innerHTML = marked.parse(sections.ideas);
        document.getElementById('section-plan').innerHTML = marked.parse(sections.plan);
        document.getElementById('section-pitches').innerHTML = marked.parse(sections.pitches);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
