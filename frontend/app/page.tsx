import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
    return (
        <div>
            <h1 className="bg-amber-300 font-semibold mb-4">Dashboard</h1>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Please enter your credentials to access the dashboard.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
