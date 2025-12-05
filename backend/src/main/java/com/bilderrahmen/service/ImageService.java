package com.bilderrahmen.service;

import com.bilderrahmen.entity.Image;
import com.bilderrahmen.repository.ImageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    public Image saveImageFile(MultipartFile file) throws IOException {
        System.out.println("saveImageFile().");

        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) {
            // Create uploads directory if it doesn't exist.
            Files.createDirectories(uploadDir);
        }

        String originalFilename = file.getOriginalFilename();
      
        // Save file to disk.
        Path filePath = uploadDir.resolve(originalFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create Image entity.
        Image image = new Image();
        image.setFileName(originalFilename);
        image.setFilePath("/uploads/" + originalFilename);
        image.setFileSize(file.getSize());

        // Save to database. 
        return imageRepository.save(image);
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