const debounce = (fn, ms) => {
    let timeout;
    return function() {
        const fnCall = () => {fn.apply(this, arguments)}
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, ms);
    }
}

class View {
    currentDropdownRepos = [];
    constructor() {
        this.app = document.getElementById('app');

        this.searchLine = this.createElement('div', 'search-line');
        this.searchInput = this.createElement('input', 'search-input');
        this.searchInput.placeholder = 'Type to search..';
        this.dropdownList = this.createElement('ul', 'dropdown-list');
        this.dropdownList.classList.add('hidden');
        this.searchLine.append(this.searchInput);
        this.searchLine.append(this.dropdownList);

        this.repoWrapper = this.createElement('div', 'repo-wrapper');
        this.repoCardsList = this.createElement('ul', 'repo-cards');
        this.repoWrapper.classList.add('hidden');
        this.repoWrapper.append(this.repoCardsList);

        this.main = this.createElement('div', 'main');
        this.main.append(this.repoWrapper);

        this.app.append(this.searchLine);
        this.app.append(this.main);
    }

    createElement(elTag, elClass) {
        const el = document.createElement(elTag);
        if (elClass) {
            el.classList.add(elClass);
        }
        return el;
    }

    createRepo(repo) {
        const repoEl = this.createElement('li', 'repo');
        repoEl.textContent = repo.name;
        repoEl.setAttribute('id', `repo-${repo.id}`)
        this.dropdownList.append(repoEl);
        this.currentDropdownRepos.push(repo);
    }

    addRepoCard(repoEl) {
        const repoCard = this.createElement('div', 'repo-card');
        let repoId = repoEl.getAttribute('id');
        for (let repo of this.currentDropdownRepos) {
            let Id = `repo-${repo.id}`;
            if (repoId === Id) {
                const name = `Name: ${repo.name}`;
                const owner = `Owner: ${repo.owner.login}`;
                const stars = `Stars: ${repo.stargazers_count}`;

                const nameText = this.createElement('span', 'repo-card--text');
                nameText.textContent = name;
                const ownerText = this.createElement('span', 'repo-card--text');
                ownerText.textContent = owner;
                const starsText = this.createElement('span', 'repo-card--text');
                starsText.textContent = stars;

                repoCard.append(nameText);
                repoCard.append(ownerText);
                repoCard.append(starsText);

                const closeBtn = this.createElement('button', 'button');
                closeBtn.classList.add('close-button');
                repoCard.append(closeBtn);
            }
        }
        this.repoCardsList.append(repoCard);
    }

    deleteRepoCard(btn) {
        let repoCard = btn.closest('.repo-card');
        console.log(repoCard)
        repoCard.remove();
    }

    clearRepoDropdownList() {
        this.currentDropdownRepos = [];
        const dropdown = document.querySelector('.dropdown-list');
        while (dropdown.firstChild) {
            dropdown.removeChild(dropdown.firstChild);
        }
    }
}

class Search {
    constructor(view) {
        this.view = view;
        this.view.searchInput.addEventListener('keyup', debounce(this.searchRepos.bind(this), 500));
        this.view.dropdownList.addEventListener('click', async (evt) => {
            let target = evt.target;
            this.view.addRepoCard(target)
            this.view.repoWrapper.classList.remove('hidden');
            this.view.searchInput.value = '';
            this.view.clearRepoDropdownList();
        });
        this.view.repoCardsList.addEventListener('click', (evt) => {
            let target = evt.target.closest('.button');
            if (target) this.view.deleteRepoCard(target);
            else return;
        })
    }

    async searchRepos() {
        this.view.clearRepoDropdownList();
        if (this.view.searchInput.value && this.view.searchInput.value !== ' ') {
            return await fetch(`https://api.github.com/search/repositories?q=${this.view.searchInput.value}&per_page=5`)
            .then((res) => {
                if (res.ok) {
                    let resArr = res.json().then(arr => {
                        for (let repo of arr.items) {
                            this.view.createRepo(repo);
                        }
                    })
                    this.view.dropdownList.classList.remove('hidden');
                    return resArr;
                }
            })
        } else {
            this.view.clearRepoDropdownList();
        }
    }
}

new Search(new View());