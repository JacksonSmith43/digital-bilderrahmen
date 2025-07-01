import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class GalleryService {

    images = [
        { src: "assets/assassins-creed.jpg", alt: "Assassin´s-creed logo." },
        { src: "assets/car.jpg", alt: "Cool looking car." },
        { src: "assets/guinea-pig.jpg", alt: "A Guinea Pig lifting weights." },
        { src: "assets/hamsterviel.bmp", alt: "Hamsterviel laughing evily." },
        { src: "assets/snowman.JPG", alt: "A person standing behind a devil looking snowman." },
    ]
} 