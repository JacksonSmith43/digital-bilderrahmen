import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class GalleryService {

    images = [
        { src: "assets/assassins-creed.jpg", alt: "Assassin´s-creed logo.", relativePath: "" },
        { src: "assets/car.jpg", alt: "Cool looking car.", relativePath: "" },
        { src: "assets/guinea-pig.jpg", alt: "A Guinea Pig lifting weights.", relativePath: "" },
        { src: "assets/hamsterviel.bmp", alt: "Hamsterviel laughing evily.", relativePath: "" },
        { src: "assets/snowman.JPG", alt: "A person standing behind a devil looking snowman.", relativePath: "" },
    ]

    getImageRemoval() {

    }
} 