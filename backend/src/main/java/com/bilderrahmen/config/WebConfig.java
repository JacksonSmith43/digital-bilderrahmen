package com.bilderrahmen.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Makes backend/uploads/ directory available under /uploads/** URL
        registry.addResourceHandler("/uploads/**")
                // Looks for: backend/uploads/foto.jpg (in the filesystem)
                .addResourceLocations("file:backend/uploads/");
    }
}
