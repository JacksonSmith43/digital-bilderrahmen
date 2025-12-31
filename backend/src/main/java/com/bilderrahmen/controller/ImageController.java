package com.bilderrahmen.controller;

import com.bilderrahmen.entity.Image;
import com.bilderrahmen.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/gallery/images")
@CrossOrigin(origins = "http://localhost:4200")
public class ImageController {

    @Autowired
    private ImageService imageService;

    @GetMapping
    public ResponseEntity<List<Image>> getAllImages() {
        System.out.println("getAllImages().");
        try {
            List<Image> images = imageService.getAllImagesForGallery();

            if (images.isEmpty()) {
                return ResponseEntity.ok(images); // 200 (OK) status with an empty list.
            }

            return ResponseEntity.ok(images); // 200 (OK) status with images.

        } catch (Exception e) {
            System.err.println("getAllImages()_Controller error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 (Error).
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<Image> uploadImage(@RequestParam("file") MultipartFile file) {
        System.out.println("uploadImage().");

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Image savedImage = imageService.saveImageFile(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedImage); // 201 (Created).

        } catch (Exception e) {
            System.err.println("uploadImage()_Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // @PathVariable extracts the ID out of the URL and converts it into a Long.
    @DeleteMapping("/deleted/{id}") // /api/gallery/images/deleted/{id}
    public ResponseEntity<Boolean> deleteImage(@PathVariable Long id) {
        System.out.println("deleteImage().");

        try {
            boolean isDeleted = imageService.deleteImageById(id);

            if (isDeleted) {
                return ResponseEntity.ok(true); // 200 Ok.

            } else {
                return ResponseEntity.notFound().build(); // 404 Not found.
            }
        } catch (Exception e) {
            // 500 Error.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    @PostMapping("/{id}/{isOnDevice}")
    public ResponseEntity<Void> toggleImageForDevice(@PathVariable Long id, @PathVariable boolean isOnDevice) {
        System.out.println("toggleImageForDevice()_id: " + id);
        System.out.println("toggleImageForDevice()_isOnDevice: " + isOnDevice);

        try {

            if (id == null) {
                return ResponseEntity.badRequest().build();
            }

            boolean success = imageService.toggleDeviceImagesState(id, isOnDevice);

            if (success) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            System.err.println("toggleImageForDevice()_Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}