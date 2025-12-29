package com.bilderrahmen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bilderrahmen.entity.Image;
import com.bilderrahmen.service.ImageService;

@RestController
@RequestMapping("/api/device/images")
@CrossOrigin(origins = "http://localhost:4200")
public class DeviceController {

    @Autowired
    private ImageService imageService;

    @PostMapping("/{id}")
    public ResponseEntity<Void> selectImageForDevice(@PathVariable Long id) {
        System.out.println("selectImageForDevice()_id: " + id);

        try {
            if (id == null) {
                return ResponseEntity.badRequest().build();
            }

            boolean success = imageService.setCurrentIdPartOfSelectedDeviceImages(id);
            
            if (success) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            System.err.println("selectImageForDevice()_Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
