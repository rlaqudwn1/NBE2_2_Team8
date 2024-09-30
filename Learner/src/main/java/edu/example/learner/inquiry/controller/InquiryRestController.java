package edu.example.learner.inquiry.controller;

import edu.example.learner.inquiry.dto.InquiryDTO;
import edu.example.learner.inquiry.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquiryRestController {
    private final InquiryService inquiryService;

    @GetMapping("/{inquiryId}")
    public ResponseEntity<InquiryDTO> read(@PathVariable("inquiryId") Long inquiryId) {
        return ResponseEntity.ok(inquiryService.read(inquiryId));
    }

    @GetMapping
    public ResponseEntity<List<InquiryDTO>> readAll() {
        return ResponseEntity.ok(inquiryService.readAll());
    }

    @PostMapping
    public ResponseEntity<InquiryDTO> create(@Validated @RequestBody InquiryDTO inquiryDTO) {
        return ResponseEntity.ok(inquiryService.register(inquiryDTO));
    }

    @PutMapping("/{inquiryId}")
    public ResponseEntity<InquiryDTO> update(@PathVariable("inquiryId") Long inquiryId, @Validated @RequestBody InquiryDTO inquiryDTO) {
        inquiryDTO.setInquiryId(inquiryId);
        return ResponseEntity.ok(inquiryService.update(inquiryDTO));
    }

    @DeleteMapping("/{inquiryId}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable("inquiryId") Long inquiryId) {
        inquiryService.delete(inquiryId);
        return ResponseEntity.ok(Map.of("result", "success"));
    }
}