// This file initializes Angular testing and imports the application test suites.

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

import './app/app-routing.module.spec';
import './app/app.component.spec';
import './app/components/header/header.component.spec';
import './app/components/medal-evolution-chart/medal-evolution-chart.component.spec';
import './app/components/medals-chart/medals-chart.component.spec';
import './app/pages/country-detail/country-detail.component.spec';
import './app/pages/dashboard/dashboard.component.spec';
import './app/pages/not-found/not-found.component.spec';
import './app/services/data.service.spec';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
