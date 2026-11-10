import { Component } from '@angular/core';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { Guitar, GUITAR_TYPES, GUITAR_STATUSES } from '../guitar.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  guitars: Guitar[] = [];
  loading = false;

  searchTerm = '';
  sortKey: 'brand' | 'model' | 'price' | 'stock' | 'status' = 'brand';
  sortDir: 'asc' | 'desc' = 'asc';

  types = GUITAR_TYPES;
  statuses = GUITAR_STATUSES;

  isModalOpen = false;
  editingId: string | null = null;
  form: Guitar = this.emptyForm();

  isConfirmOpen = false;
  toDelete: Guitar | null = null;

  isToastOpen = false;
  toastMsg = '';
  toastColor = 'success';

  ionViewWillEnter() {
    this.loadGuitars();
  }

  emptyForm(): Guitar {
    return {
      brand: '',
      model: '',
      type: 'Acoustic',
      price: 0,
      stock: 1,
      status: 'Available',
      renter: '',
    };
  }

  async loadGuitars(event?: any) {
    this.loading = true;
    try {
      const snap = await getDocs(collection(db, 'guitars'));
      this.guitars = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Guitar),
      }));
    } catch (err) {
      console.error(err);
      this.showToast('Failed to load guitars.', 'danger');
    } finally {
      this.loading = false;
      if (event) {
        event.target.complete();
      }
    }
  }

  get displayedGuitars(): Guitar[] {
    const term = this.searchTerm.trim().toLowerCase();

    const filtered = this.guitars.filter((g) => {
      if (!term) {
        return true;
      }
      return (
        (g.brand || '').toLowerCase().includes(term) ||
        (g.model || '').toLowerCase().includes(term) ||
        (g.type || '').toLowerCase().includes(term)
      );
    });

    const dir = this.sortDir === 'asc' ? 1 : -1;

    return filtered.sort((a, b) => {
      const va = a[this.sortKey];
      const vb = b[this.sortKey];
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * dir;
      }
      return String(va ?? '').localeCompare(String(vb ?? '')) * dir;
    });
  }

  toggleSortDir() {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
  }

  openEdit(g: Guitar) {
    this.editingId = g.id ?? null;
    this.form = { ...g };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingId = null;
  }

  isFormValid(): boolean {
    return (
      this.form.brand.trim().length > 0 &&
      this.form.model.trim().length > 0 &&
      Number(this.form.price) > 0 &&
      Number(this.form.stock) >= 0
    );
  }

  async updateGuitar() {
    if (!this.editingId) {
      return;
    }
    if (!this.isFormValid()) {
      this.showToast('Please complete all required fields.', 'warning');
      return;
    }

    this.loading = true;
    try {
      await updateDoc(doc(db, 'guitars', this.editingId), {
        brand: this.form.brand.trim(),
        model: this.form.model.trim(),
        type: this.form.type,
        price: Number(this.form.price),
        stock: Number(this.form.stock),
        status: this.form.status,
        renter: this.form.status === 'Rented' ? this.form.renter.trim() : '',
      });

      this.showToast('Guitar updated successfully.');
      this.closeModal();
      await this.loadGuitars();
    } catch (err) {
      console.error(err);
      this.showToast('Update failed.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  askDelete(g: Guitar) {
    this.toDelete = g;
    this.isConfirmOpen = true;
  }

  deleteButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        this.isConfirmOpen = false;
        this.toDelete = null;
      },
    },
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => {
        this.isConfirmOpen = false;
        this.deleteGuitar();
      },
    },
  ];

  async deleteGuitar() {
    if (!this.toDelete?.id) {
      return;
    }
    this.loading = true;
    try {
      await deleteDoc(doc(db, 'guitars', this.toDelete.id));
      this.showToast('Guitar deleted.');
      this.toDelete = null;
      await this.loadGuitars();
    } catch (err) {
      console.error(err);
      this.showToast('Delete failed.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  statusColor(status: string): string {
    if (status === 'Available') {
      return 'success';
    }
    if (status === 'Rented') {
      return 'warning';
    }
    return 'medium';
  }

  showToast(msg: string, color: string = 'success') {
    this.toastMsg = msg;
    this.toastColor = color;
    this.isToastOpen = true;
  }

  trackById(index: number, item: Guitar) {
    return item.id ?? index;
  }
}