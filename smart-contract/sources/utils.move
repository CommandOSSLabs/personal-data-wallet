module pdw::utils {
    use std::vector;

    /// Check if `prefix` is a prefix of `data`
    public fun is_prefix(prefix: vector<u8>, data: vector<u8>): bool {
        let prefix_len = vector::length(&prefix);
        let data_len = vector::length(&data);
        
        if (prefix_len > data_len) {
            return false
        };
        
        let i = 0;
        while (i < prefix_len) {
            if (*vector::borrow(&prefix, i) != *vector::borrow(&data, i)) {
                return false
            };
            i = i + 1;
        };
        
        true
    }

    #[test]
    fun test_is_prefix() {
        let prefix = b"hello";
        let data = b"hello world";
        assert!(is_prefix(prefix, data), 0);
        
        let prefix2 = b"world";
        assert!(!is_prefix(prefix2, data), 1);
        
        let prefix3 = b"hello world extra";
        assert!(!is_prefix(prefix3, data), 2);
    }
}