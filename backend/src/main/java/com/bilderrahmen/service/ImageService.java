package com.bilderrahmen.service;

import com.bilderrahmen.entity.Image;
import com.bilderrahmen.repository.ImageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class ImageService {

    @Autowired
    private ImageRepository imageRepository;

    public List<Image> getAllImagesForGallery() {
        try {
            List<Image> images = imageRepository.findAll();

            // Only return images with valid fileName and filePath.
            return images.stream()
                    .filter(image -> image.getFileName() != null && !image.getFileName().isEmpty())
                    .filter(image -> image.getFilePath() != null && !image.getFilePath().isEmpty())
                    .toList();

        } catch (Exception e) {
            System.err.println("getAllImagesForGallery()_Error loading images: " + e.getMessage());
            return List.of(); // Return an empty list in case of an error.
        }
    }

    public Image saveImage(Image image) {
        try {
            // Validation.
            if (image.getFileName() == null || image.getFileName().isEmpty()) {
                throw new IllegalArgumentException("saveImage()_Filename is not allowed to be empty.");
            }

            return imageRepository.save(image);
        } catch (Exception e) {
            System.err.println("saveImage()_Error saving image: " + e.getMessage());
            return null;
        }
    }

    public boolean deleteImageById(Long id) {
        System.out.println("deleteImageById().");
        try {
            if (id == null) {
                throw new IllegalArgumentException("deleteImageById()_ ID cannot be null.");
            }

            if (!imageRepository.existsById(id)) {
                throw new IllegalArgumentException("deleteImageById()_Image has not been found.");
            }

            Optional<Image> imageObject = imageRepository.findById(id);
            if (imageObject.isPresent()) {
                deletePhysicalFile(imageObject.get().getFilePath());
            }

            imageRepository.deleteById(id); // Deletes it out of the database.
            return true;

        } catch (Exception e) {
            System.err.println("deleteImageById()_Deletion failed: " + e.getMessage());
            return false;
        }
    }

    private void deletePhysicalFile(String fileName) {
        System.out.println("deletePhysicalFile().");
        try {
            Path path = Paths.get("uploads/" + fileName);
            Files.deleteIfExists(path); // Deletes the file from the hard drive.

        } catch (IOException e) {
            System.err.println("deletePhysicalFile()_Could not delete the file: " + e.getMessage());
        }
    }

}