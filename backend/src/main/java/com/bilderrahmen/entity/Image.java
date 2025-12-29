package com.bilderrahmen.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "images")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "is_selected_for_device")
    private Boolean isSelectedForDevice;

    public Image() {
        this.uploadDate = LocalDateTime.now();
    }

    public Image(Long id) {
        this.id = id;
    }

    public Image(String fileName, String filePath, Long fileSize, Boolean isSelectedForDevice) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.isSelectedForDevice = isSelectedForDevice;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Boolean getIsSelectedForDevice() {
        return isSelectedForDevice;
    }

    public void setIsSelectedForDevice(Boolean isSelectedForDevice) {
        this.isSelectedForDevice = isSelectedForDevice;
    }
}