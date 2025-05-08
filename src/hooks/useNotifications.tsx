import { useToast } from "@/components/ui/use-toast"

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
  title: string
  message: string
  type: NotificationType
}

export function useNotifications() {
  const { toast } = useToast()

  const addNotification = ({ title, message, type }: Notification) => {
    toast({
      title,
      description: message,
      variant: type === 'success' ? 'success' : type === 'error' ? 'destructive' : 'default',
      duration: 5000,
    })
  }

  return {
    addNotification,
  }
} 