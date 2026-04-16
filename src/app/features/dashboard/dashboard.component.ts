import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { QuantityService } from '../../core/services/quantity.service';
import { UnitCategory, OperationType, UNIT_MAPS, Quantity, HistoryItem } from '../../shared/models/quantity.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentType: UnitCategory = 'length';
  currentOp: OperationType = 'convert';
  currentUnits: string[] = [];

  // Convert
  convertFromValue = 1;
  convertFromUnit = '';
  convertToUnit = '';
  convertToValue: number | null = null;

  // Compare
  q1Value = 1; q1Unit = '';
  q2Value = 1; q2Unit = '';

  // Add
  addQ1Value = 1; addQ1Unit = '';
  addQ2Value = 1; addQ2Unit = '';

  // Subtract
  subQ1Value = 1; subQ1Unit = '';
  subQ2Value = 1; subQ2Unit = '';

  // Divide
  divQ1Value = 100; divQ1Unit = '';
  divQ2Value = 2;   divQ2Unit = '';

  result = '';
  resultError = false;

  historyOpen = false;
  historyItems: HistoryItem[] = [];
  historyLoading = false;
  historyError = '';

  readonly typeCategories: UnitCategory[] = ['length', 'temperature', 'volume', 'weight'];
  readonly operations: OperationType[] = ['convert', 'compare', 'add', 'subtract', 'divide'];

  constructor(private auth: AuthService, private qSvc: QuantityService) {}

  ngOnInit() {
    this.setType('length');
  }

  setType(type: UnitCategory) {
    this.currentType = type;
    this.currentUnits = UNIT_MAPS[type].units;
    const first = this.currentUnits[0];
    this.convertFromUnit = first;
    this.convertToUnit = this.currentUnits[1] ?? first;
    this.q1Unit = first; this.q2Unit = first;
    this.addQ1Unit = first; this.addQ2Unit = first;
    this.subQ1Unit = first; this.subQ2Unit = first;
    this.divQ1Unit = first; this.divQ2Unit = first;
    this.result = '';
    this.convertToValue = null;
  }

  setOp(op: OperationType) {
    this.currentOp = op;
    this.result = '';
    this.convertToValue = null;
  }

  private makeQty(value: number, unit: string): Quantity {
    return { value, unit, measurementType: UNIT_MAPS[this.currentType].type };
  }

  private showResult(text: string, isError = false) {
    this.result = text;
    this.resultError = isError;
  }

  doConvert() {
    if (isNaN(this.convertFromValue)) return this.showResult('Enter a valid number', true);
    this.showResult('Loading...');
    const q = this.makeQty(this.convertFromValue, this.convertFromUnit);
    this.qSvc.convert(q, this.convertToUnit).subscribe({
      next: data => {
        this.convertToValue = data.value;
        this.showResult(`${data.value} ${data.unit}`);
      },
      error: err => this.showResult(err.error?.message || 'Error', true)
    });
  }

  doCompare() {
    if (isNaN(this.q1Value) || isNaN(this.q2Value)) return this.showResult('Enter valid numbers', true);
    this.showResult('Loading...');
    this.qSvc.compare(this.makeQty(this.q1Value, this.q1Unit), this.makeQty(this.q2Value, this.q2Unit)).subscribe({
      next: equal => this.showResult(equal ? 'Equal ✓' : 'Not Equal ✗'),
      error: err => this.showResult(err.error?.message || 'Error', true)
    });
  }

  doAdd() {
    if (isNaN(this.addQ1Value) || isNaN(this.addQ2Value)) return this.showResult('Enter valid numbers', true);
    this.showResult('Loading...');
    this.qSvc.add(this.makeQty(this.addQ1Value, this.addQ1Unit), this.makeQty(this.addQ2Value, this.addQ2Unit)).subscribe({
      next: data => this.showResult(`${data.value} ${data.unit}`),
      error: err => this.showResult(err.error?.message || 'Error', true)
    });
  }

  doSubtract() {
    if (isNaN(this.subQ1Value) || isNaN(this.subQ2Value)) return this.showResult('Enter valid numbers', true);
    this.showResult('Loading...');
    this.qSvc.subtract(this.makeQty(this.subQ1Value, this.subQ1Unit), this.makeQty(this.subQ2Value, this.subQ2Unit)).subscribe({
      next: data => this.showResult(`${data.value} ${data.unit}`),
      error: err => this.showResult(err.error?.message || 'Error', true)
    });
  }

  doDivide() {
    if (isNaN(this.divQ1Value) || isNaN(this.divQ2Value)) return this.showResult('Enter valid numbers', true);
    this.showResult('Loading...');
    this.qSvc.divide(this.makeQty(this.divQ1Value, this.divQ1Unit), this.makeQty(this.divQ2Value, this.divQ2Unit)).subscribe({
      next: result => this.showResult(`Result: ${result}`),
      error: err => this.showResult(err.error?.message || 'Error', true)
    });
  }

  toggleHistory() {
    this.historyOpen = !this.historyOpen;
    if (this.historyOpen) this.loadHistory();
  }

  loadHistory() {
    this.historyLoading = true;
    this.historyError = '';
    this.qSvc.getHistory().subscribe({
      next: data => { this.historyItems = data; this.historyLoading = false; },
      error: () => { this.historyError = 'Failed to load history.'; this.historyLoading = false; }
    });
  }

  logout() { this.auth.logout(); }

  labelFor(cat: UnitCategory): string {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  labelForOp(op: OperationType): string {
    const labels: Record<OperationType, string> = {
      convert: 'Convert ↔', compare: 'Compare ⚖', add: 'Add +', subtract: 'Subtract −', divide: 'Divide ÷'
    };
    return labels[op];
  }
}
