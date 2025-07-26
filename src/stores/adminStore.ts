import type { UserInfos } from "@/models/interfaces/UserInfos"
import { AdminMembersDbService } from "@/services/admin/AdminMembersDbService"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"

export const useAdminStore = defineStore('admin', () => {
    const membersList: Ref<UserInfos[]> = ref([])

    async function getAdminMembers() {
        try {
            membersList.value = await AdminMembersDbService.getAdminMembers()
        } catch (error) {
            console.log('Error fetching users:', error)
        }
    }
    return { membersList, getAdminMembers }
})