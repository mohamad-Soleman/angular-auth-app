
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AddOrderComponent } from './components/add-order/add-order.component';
import { OrdersCalendarComponent } from './components/orders-calendar/orders-calendar.component';
import { SearchOrdersComponent } from './components/search-orders/search-orders.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginGuard } from './guards/login.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'add-user', component: AddUserComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'add-order', component: AddOrderComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'orders-calendar', component: OrdersCalendarComponent, canActivate: [AuthGuard] },
  { path: 'search-orders', component: SearchOrdersComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
