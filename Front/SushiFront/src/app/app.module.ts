import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductComponent } from './product/product.component';
import { BigvaluePipe } from './bigvalue.pipe';
import { MyProgressBarComponent } from './my-progress-bar/my-progress-bar.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
//import { CountdownModule } from 'ngx-countdown';

@NgModule({
  declarations: [
    AppComponent,
    ProductComponent,
    BigvaluePipe,
    MyProgressBarComponent,
  ],
  imports: [
    BrowserModule,
    //CountdownModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatSnackBarModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
