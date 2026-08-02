import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('title', 'Medals per Country');
    fixture.componentRef.setInput('indicators', [
      { label: 'Number of countries', value: 5 },
    ]);
    fixture.detectChanges();
  });

  it('renders the title and indicators', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain(
      'Medals per Country',
    );
    expect(element.querySelector('dd')?.textContent).toContain('5');
  });
});
