import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  cycles: { value: string; label: string }[] = [];
  selectedCycle = '';
  subhead = '';
  activeTab = 'Dashboard';
  @Output() activeTabChange = new EventEmitter<string>();



  ngOnInit() {
    this.buildCycleSelect();
  }


  buildCycleSelect() {
    // Stub data — replace with real expense cycles later
    this.cycles = [
      { value: '2026-01-01', label: 'January 2026' },
      { value: '2025-12-01', label: 'December 2025' },
      { value: '2025-11-01', label: 'November 2025' },
    ];

    this.selectedCycle = this.cycles[0].value;
    this.subhead = this.cycles[0].label;
  }

  onCycleChange(value: string) {
    this.subhead = this.cycles.find(c => c.value === value)?.label ?? '';
  }

  switchTab(tab: string) {
    console.log('Switching to tab:', tab);
    this.activeTab = tab;
    this.activeTabChange.emit(tab);
  }

  isActiveTab(tab: string) {
    return this.activeTab === tab;
  }
}
