import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Guitar, GUITAR_TYPES, GUITAR_STATUSES } from '../guitar.model';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  form: Guitar = this.emptyForm();
  types = GUITAR_TYPES;
  statuses = GUITAR_STATUSES;

  saving = false;
  isToastOpen = false;
  toastMsg = '';
  toastColor = 'success';

  constructor(private router: Router) {}

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

  isFormValid(): boolean {
    return (
      this.form.brand.trim().length > 0 &&
      this.form.model.trim().length > 0 &&
      Number(this.form.price) > 0 &&
      Number(this.form.stock) >= 0
    );
  }

  async addGuitar() {
    if (!this.isFormValid()) {
      this.showToast('Please complete all required fields.', 'warning');
      return;
    }

    this.saving = true;
    try {
      await addDoc(collection(db, 'guitars'), {
        brand: this.form.brand.trim(),
        model: this.form.model.trim(),
        type: this.form.type,
        price: Number(this.form.price),
        stock: Number(this.form.stock),
        status: this.form.status,
        renter: this.form.status === 'Rented' ? this.form.renter.trim() : '',
        createdAt: serverTimestamp(),
      });

      this.showToast('Guitar added successfully.');
      this.form = this.emptyForm();
      this.router.navigateByUrl('/tabs/tab2');
    } catch (err) {
      console.error(err);
      this.showToast('Save failed. Check your connection.', 'danger');
    } finally {
      this.saving = false;
    }
  }

  clearForm() {
    this.form = this.emptyForm();
  }

  goToInventory() {
    this.router.navigateByUrl('/tabs/tab2');
  }

  showToast(msg: string, color: string = 'success') {
    this.toastMsg = msg;
    this.toastColor = color;
    this.isToastOpen = true;
  }
}