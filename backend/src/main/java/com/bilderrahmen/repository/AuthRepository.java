package com.bilderrahmen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bilderrahmen.entity.Auth;
import java.util.List;

@Repository
public interface AuthRepository extends JpaRepository<Auth, Long> {
    List<Auth> getByEmail(String email);

    List<Auth> getByPassword(String password);

    List<Auth> findByEmail(String email);

    List<Auth> findByPassword(String password);

    void deleteById(Long id);
}
