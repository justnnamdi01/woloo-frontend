const API_BASE = localStorage.getItem('API_BASE') || 'https://woloo-backend.onrender.com';

const app = Vue.createApp({
	data() {
		return {
			lessons: [],
			cart: [],
			showCart: false,
			sortKey: 'subject',
			sortDir: 'asc',
			searchQuery: '',
			checkout: { name: '', phone: '' },
			orderMessage: ''
		};
	},
	computed: {
		sortedLessons() {
			const copy = this.filteredLessons.slice();
			const key = this.sortKey;
			const dir = this.sortDir === 'asc' ? 1 : -1;
			return copy.sort((a, b) => {
				let va = a[key];
				let vb = b[key];
				if (typeof va === 'string') va = va.toLowerCase();
				if (typeof vb === 'string') vb = vb.toLowerCase();
				if (va < vb) return -1 * dir;
				if (va > vb) return 1 * dir;
				return 0;
			});
		},
		filteredLessons() {
			if (!this.searchQuery) return this.lessons;
			const q = this.searchQuery.toLowerCase();
			return this.lessons.filter(l =>
				(String(l.subject).toLowerCase().includes(q)) ||
				(String(l.location).toLowerCase().includes(q)) ||
				(String(l.price).toLowerCase().includes(q)) ||
				(String(l.spaces).toLowerCase().includes(q))
			);
		},
		cartCount() {
			return this.cart.reduce((s, i) => s + i.quantity, 0);
		},
		cartTotal() {
			return this.cart.reduce((s, i) => s + i.price * i.quantity, 0);
		},
		validName() {
			return /^[A-Za-z\s]+$/.test(this.checkout.name || '');
		},
		validPhone() {
			return /^\d+$/.test(this.checkout.phone || '');
		},
		canCheckout() {
			return this.cart.length > 0 && this.validName && this.validPhone;
		}
	},
	mounted() {
		this.fetchLessons();
	},
	methods: {
		async fetchLessons() {
			const res = await fetch(`${API_BASE}/lessons`);
			this.lessons = await res.json();
		},
		toggleCart() {
			this.showCart = !this.showCart;
		},
		addToCart(lesson) {
			if (lesson.spaces === 0) return;
			lesson.spaces -= 1;
			const existing = this.cart.find(i => i._id === lesson._id);
			if (existing) existing.quantity += 1; else this.cart.push({ ...lesson, quantity: 1 });
		},
		removeFromCart(item) {
			const idx = this.cart.findIndex(i => i._id === item._id);
			if (idx !== -1) {
				// restore space
				const lesson = this.lessons.find(l => l._id === item._id);
				if (lesson) lesson.spaces += 1;
				if (this.cart[idx].quantity > 1) this.cart[idx].quantity -= 1; else this.cart.splice(idx, 1);
			}
		},
		onSearchInput: debounce(async function() {
			if (!this.searchQuery) {
				await this.fetchLessons();
				return;
			}
			try {
				const url = `${API_BASE}/search?q=${encodeURIComponent(this.searchQuery)}`;
				const res = await fetch(url);
				if (res.ok) {
					this.lessons = await res.json();
				}
			} catch (e) {
				// fallback to client filter
			}
		}, 300),
		async submitOrder() {
			if (!this.canCheckout) return;
			const order = {
				name: this.checkout.name.trim(),
				phone: this.checkout.phone.trim(),
				items: this.cart.map(i => ({ lessonId: i._id, quantity: i.quantity }))
			};
			const res = await fetch(`${API_BASE}/orders`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(order)
			});
			if (res.ok) {
				// Update spaces via PUT for each ordered lesson
				for (const item of order.items) {
					const lesson = this.lessons.find(l => l._id === item.lessonId);
					if (!lesson) continue;
					await fetch(`${API_BASE}/lessons/${lesson._id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ spaces: lesson.spaces })
					});
				}
				this.orderMessage = 'Order submitted!';
				this.cart = [];
				this.showCart = false;
			} else {
				this.orderMessage = 'Order failed. Please try again.';
			}
		}
	}
});

function debounce(fn, wait) {
	let timeoutId = null;
	return function(...args) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), wait);
	};
}

app.mount('#app');


