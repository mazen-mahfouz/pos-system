import { useAuthStore } from "~/stores/auth";

export default function handlePickFile(file) {
    const AuthStore = useAuthStore();
    // const { t } = useI18n();
    const returnedFileData = {
        name: null,
        size: null,
        type: null,
        file: null,
        url: null,
    };

    const imageExt = ["png", "jpg", "jpeg"];
    if (file) {
        const extension = file.name.split(".").pop().toLowerCase();
        const file_size = file.size / (1024 * 1024);

        if (imageExt.includes(extension)) {
            if (file_size.toFixed(2) <= 5) {
                returnedFileData.name = file.name;
                returnedFileData.size = file.size;
                returnedFileData.type = file.type;
                returnedFileData.file = file;
                returnedFileData.url = URL.createObjectURL(file);

                // Initialize an upload operation
                // initializeUpload();
            } else {
                push.error(t("file_size_limit"));
            }
        } else {
            push.error(t("invalid_file_type"));
        }
    }

    return returnedFileData;
}
