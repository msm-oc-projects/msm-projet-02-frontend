import { provideHttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MedalEvolutionChartComponent } from './components/medal-evolution-chart/medal-evolution-chart.component';
import { MedalsChartComponent } from './components/medals-chart/medals-chart.component';
import { CountryDetailComponent } from './pages/country-detail/country-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    CountryDetailComponent,
    DashboardComponent,
    HeaderComponent,
    MedalEvolutionChartComponent,
    MedalsChartComponent,
    NotFoundComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
