(() => {
    'use strict';

    const GITHUB_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    const renderTags = (tags) => {
        return tags.map(t => `<span class="tag">${t}</span>`).join('');
    };

    const renderImages = (images) => {
        if (!images || images.length === 0) {
            return '<div class="project-detail__empty">No photos yet — coming soon.</div>';
        }
        return images.map(src => `<img src="${src}" alt="Project screenshot" loading="lazy">`).join('');
    };

    const renderNotFound = () => `
        <div class="project-detail__notfound">
            <h1 class="project-detail__title">Project not found</h1>
            <p>This project doesn't exist or was moved.</p>
            <a href="index.html#projects" class="btn btn-primary">Back to portfolio</a>
        </div>
    `;

    const renderProject = (project) => {
        const githubBtn = project.github && project.github.trim() !== ''
            ? `<a href="${project.github}" class="btn btn-primary" target="_blank" rel="noopener">
                ${GITHUB_SVG}<span>View on GitHub</span>
               </a>`
            : '';

        const overview = (project.overview || project.portfolioDesc || '')
            .split('\n')
            .map(p => `<p>${p}</p>`)
            .join('');

        return `
            <a href="index.html#projects" class="project-detail__back">&#8592; Back to portfolio</a>
            <article class="project-detail__card">
                <header class="project-detail__header">
                    <span class="section-tag">${project.category || 'Project'}</span>
                    <h1 class="project-detail__title">${project.title}</h1>
                    <div class="tag-group">${renderTags(project.tags || [])}</div>
                    <p class="project-detail__desc">${project.portfolioDesc || ''}</p>
                </header>
                <section class="project-detail__gallery">
                    ${renderImages(project.images)}
                </section>
                <section class="project-detail__info">
                    ${overview}
                </section>
                ${githubBtn ? `<footer class="project-detail__actions">${githubBtn}</footer>` : ''}
            </article>
        `;
    };

    document.addEventListener('DOMContentLoaded', async () => {
        const container = document.getElementById('projectContent');
        container.hidden = false;

        try {
            const res = await fetch('photos.json');
            if (!res.ok) throw new Error('Failed to load project data');
            const data = await res.json();

            const project = (data.projects || []).find(p => p.id === projectId);
            container.innerHTML = project ? renderProject(project) : renderNotFound();
            document.title = project ? `${project.title} | Portfolio` : 'Project | Portfolio';
        } catch (err) {
            container.innerHTML = `
                <div class="project-detail__notfound">
                    <h1 class="project-detail__title">Something went wrong</h1>
                    <p>${err.message}</p>
                    <a href="index.html#projects" class="btn btn-primary">Back to portfolio</a>
                </div>
            `;
        }
    });
})();