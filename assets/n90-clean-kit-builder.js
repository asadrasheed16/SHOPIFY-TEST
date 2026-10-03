(() => {
  if (!customElements.get('nn-kit-builder')) {
    class KitBuilder extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready) return;
        this.dataset.ready = 'true';
        this.form = this.querySelector('form');
        this.steps = [...this.querySelectorAll('[data-kit-step]')];
        if (!this.form || !this.steps.length) return;
        this.index = 0;
        this.form.noValidate = true;
        this.querySelector('[data-kit-progress]').hidden = false;
        this.back = this.querySelector('[data-kit-back]');
        this.next = this.querySelector('[data-kit-next]');
        this.submit = this.querySelector('[data-kit-submit]');
        this.back.addEventListener('click', () => this.showStep(this.index - 1, true));
        this.next.addEventListener('click', () => {
          if (this.validateStep(this.index)) this.showStep(this.index + 1, true);
        });
        this.form.addEventListener('input', () => this.updateSummary());
        this.form.addEventListener('change', () => this.updateSummary());
        this.form.addEventListener('formdata', (event) => this.prepareEnquiry(event.formData));
        this.form.addEventListener('submit', (event) => {
          if (this.index < this.steps.length - 1) {
            event.preventDefault();
            if (this.validateStep(this.index)) this.showStep(this.index + 1, true);
            return;
          }
          for (let i = 0; i < this.steps.length; i += 1) {
            const invalid = this.invalidField(i);
            if (invalid) {
              event.preventDefault();
              this.showStep(i, false);
              invalid.reportValidity();
              invalid.focus();
              return;
            }
          }
          // Submit the native Shopify form. Shopify alone determines success.
        });
        const error = this.querySelector('[data-kit-error]');
        this.showStep(error ? this.steps.length - 1 : 0, false);
        this.updateSummary();
      }
      invalidField(index) {
        return [...this.steps[index].querySelectorAll('input, select, textarea')].find((field) => !field.checkValidity());
      }
      prepareEnquiry(data) {
        // Keep every contact field in Shopify's request and also include a readable
        // summary in the message body. Never overwrite the customer's notes field.
        const labels = [
          'Sport', 'Kit required', 'Add shorts', 'Add socks', 'Add bags',
          'Add jackets', 'Add club shop', 'Add personalisation', 'Number of players',
          'Age group', 'Preferred delivery date', 'Main colour', 'Second colour',
          'Crest link', 'name', 'Club name', 'email', 'phone', 'WhatsApp updates consent'
        ];
        const lines = ['Custom kit design and quote enquiry'];
        for (const label of labels) {
          const value = data.get(`contact[${label}]`);
          if (value) lines.push(`${label.charAt(0).toUpperCase() + label.slice(1)}: ${value}`);
        }
        const notes = this.form.elements.namedItem('contact[body]');
        lines.push('', 'Design notes:', notes && notes.value.trim() ? notes.value.trim() : 'No additional notes.');
        data.set('contact[body]', lines.join('\n'));
      }
      validateStep(index) {
        const invalid = this.invalidField(index);
        if (!invalid) return true;
        invalid.reportValidity();
        invalid.focus();
        return false;
      }
      showStep(index, focus) {
        this.index = Math.max(0, Math.min(index, this.steps.length - 1));
        this.steps.forEach((step, position) => { step.hidden = position !== this.index; });
        this.querySelectorAll('[data-progress-step]').forEach((item, position) => {
          if (position === this.index) item.setAttribute('aria-current', 'step');
          else item.removeAttribute('aria-current');
        });
        this.back.hidden = this.index === 0;
        this.next.hidden = this.index === this.steps.length - 1;
        this.submit.hidden = this.index !== this.steps.length - 1;
        this.querySelector('[data-kit-status]').textContent = `Step ${this.index + 1} of ${this.steps.length}`;
        if (focus) {
          const legend = this.steps[this.index].querySelector('legend');
          legend.tabIndex = -1;
          legend.focus();
        }
      }
      updateSummary() {
        const value = (name) => {
          const field = this.form.elements.namedItem(name);
          return field && field.value ? field.value : 'Not selected';
        };
        const values = {
          sport: value('contact[Sport]'),
          items: value('contact[Kit required]'),
          players: value('contact[Number of players]'),
          ages: value('contact[Age group]'),
          colours: [value('contact[Main colour]'), value('contact[Second colour]')].filter(v => v !== 'Not selected').join(' / ') || 'Not selected',
          crest: value('contact[Crest link]') === 'Not selected' ? 'To follow' : 'Link included'
        };
        this.querySelectorAll('[data-kit-summary]').forEach((item) => { item.textContent = values[item.dataset.kitSummary]; });
      }
    }
    customElements.define('nn-kit-builder', KitBuilder);
  }
  if (!customElements.get('nn-club-directory')) {
    class ClubDirectory extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready) return;
        this.dataset.ready = 'true';
        const controls = this.querySelector('[data-directory-controls]');
        if (!controls) return;
        const search = this.querySelector('[data-club-search]');
        const sport = this.querySelector('[data-club-sport]');
        const cards = [...this.querySelectorAll('[data-club-card]')];
        const status = this.querySelector('[data-club-status]');
        const empty = this.querySelector('[data-club-empty]');
        const sports = [...new Set(cards.map(card => card.dataset.sport).filter(Boolean))].sort();
        for (const label of sports) {
          const option = document.createElement('option');
          option.value = label;
          option.textContent = label;
          sport.appendChild(option);
        }
        controls.hidden = false;
        const filter = () => {
          const query = search.value.trim().toLocaleLowerCase();
          let count = 0;
          for (const card of cards) {
            const matches = card.dataset.search.toLocaleLowerCase().includes(query) && (!sport.value || card.dataset.sport === sport.value);
            card.hidden = !matches;
            if (matches) count += 1;
          }
          status.textContent = `${count} club ${count === 1 ? 'shop' : 'shops'} found`;
          empty.hidden = count !== 0 || cards.length === 0;
        };
        search.addEventListener('input', filter);
        sport.addEventListener('change', filter);
        filter();
      }
    }
    customElements.define('nn-club-directory', ClubDirectory);
  }
})();
