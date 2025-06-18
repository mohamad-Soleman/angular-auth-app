import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddOrderComponent } from './components/add-order/add-order.component';
import { OrdersCalendarComponent } from './components/orders-calendar/orders-calendar.component';
import { SearchOrdersComponent } from './components/search-orders/search-orders.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AppComponent } from './app.component';

import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

import { authInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    AdminPanelComponent,
    AddUserComponent,
    NavbarComponent,
    AddOrderComponent,
    OrdersCalendarComponent,
    SearchOrdersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    FullCalendarModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    AdminGuard,
    provideHttpClient(withInterceptors([authInterceptor])) 
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
