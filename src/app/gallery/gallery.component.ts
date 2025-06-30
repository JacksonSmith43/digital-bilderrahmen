import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery',
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent {

  images = [
    { src: "assets/assassins-creed.jpg", alt: "Assassin´s-creed logo." },
    { src: "assets/car.jpg", alt: "Cool looking car." },
    { src: "assets/guinea-pig.jpg", alt: "A Guinea Pig lifting weights." },
    { src: "assets/hamsterviel.bmp", alt: "Hamsterviel laughing evily." },
    { src: "assets/snowman.JPG", alt: "A person standing behind a devil looking snowman." },
  ]
}
