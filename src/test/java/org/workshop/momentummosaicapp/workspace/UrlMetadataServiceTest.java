package org.workshop.momentummosaicapp.workspace;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class UrlMetadataServiceTest {

    private final UrlMetadataService service = new UrlMetadataService();

    @Test
    void resolveMetadataWithInvalidUrlFallsBackToDomain() {
        UrlMetadataService.Metadata meta = service.resolveMetadata("https://example.com/invalid-path-12345");
        // Offline request will fail and fall back to domain name or parsed path
        assertEquals("Invalid Path 12345", meta.title());
        assertEquals(WorkspaceResourceType.LINK, meta.type());
    }

    @Test
    void resolveMetadataWithYoutubeUrlReturnsVideoType() {
        UrlMetadataService.Metadata meta = service.resolveMetadata("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        assertEquals(WorkspaceResourceType.VIDEO, meta.type());
    }

    @Test
    void appliesSpaFallbackForChatGpt() {
        UrlMetadataService.Metadata meta = service.resolveMetadata("https://chatgpt.com/c/12345");
        assertEquals("ChatGPT Conversation", meta.title());
    }

    @Test
    void appliesSpaFallbackForGithubRepo() {
        UrlMetadataService.Metadata meta = service.resolveMetadata("https://github.com/fakeuser123/fakerepo456");
        assertEquals("fakeuser123/fakerepo456", meta.title());
    }

    @Test
    void appliesSpaFallbackForArticleSlug() {
        // Simulates a Cloudflare-blocked medium article where JSoup fails
        UrlMetadataService.Metadata meta = service.resolveMetadata("https://medium.com/@username/this-is-a-great-article-test-8f7a6b5c4d3e");
        assertEquals("This Is A Great Article Test", meta.title());
    }
}
