package com.bilderrahmen.repository;

import com.bilderrahmen.entity.Image;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    // List<Image> findByFileName(String fileName);

    // List<Image> findByDescription(String description);

    // List<Image> findByFilePath(String filePath);

    // List<Image> findByFileSize(Long fileSize);

    // List<Image> findByUploadDate(LocalDateTime uploadDate);

    // List<Image> findAllByUploadDateDesc();

    // List<Image> findAll();

    // void deleteByFileName(@Param("fileName") Long fileName);

}