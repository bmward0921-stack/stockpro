import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DollarSign, Loader2, MapPin, Sparkles, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Platform, PLATFORM_LABELS } from '@/types/listing';

interface PriceSuggestionProps {
  title: string;
  category: string;
  description: string;
  onApplyPrices: (prices: Record<Platform, number>) => void;
}

interface PriceSuggestion {
  price: number;
  reasoning: string;
}

interface SuggestionsResponse {
  facebook: PriceSuggestion;
  poshmark: PriceSuggestion;
  squarespace: PriceSuggestion;
  ebay: PriceSuggestion;
  marketInsight?: string;
}

const PriceSuggestion = ({ title, category, description, onApplyPrices }: PriceSuggestionProps) => {
  const [open, setOpen] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [applied, setApplied] = useState(false);

  const getSuggestions = async () => {
    if (!title) {
      toast({
        title: 'Product title required',
        description: 'Please enter a product title first.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setSuggestions(null);
    setApplied(false);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-price', {
        body: { title, category, description, zipCode },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestions(data);
      toast({
        title: 'Price suggestions ready!',
        description: 'Review the AI-powered price recommendations.',
      });
    } catch (error: any) {
      console.error('Price suggestion error:', error);
      toast({
        title: 'Failed to get suggestions',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyPrices = () => {
    if (!suggestions) return;

    onApplyPrices({
      facebook: suggestions.facebook.price,
      poshmark: suggestions.poshmark.price,
      squarespace: suggestions.squarespace.price,
      ebay: suggestions.ebay.price,
    });

    setApplied(true);
    toast({
      title: 'Prices applied!',
      description: 'Suggested prices have been applied to enabled platforms.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Price</span> Suggest
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Price Suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zip Code Input */}
          <div className="space-y-2">
            <Label htmlFor="zipCode" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Your Zip Code (optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="zipCode"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="e.g. 90210"
                maxLength={5}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={getSuggestions}
                disabled={loading || !title}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Get Prices'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your zip code for location-based market pricing
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing market prices...</p>
            </div>
          )}

          {/* Suggestions Display */}
          {suggestions && !loading && (
            <div className="space-y-4">
              {/* Market Insight */}
              {suggestions.marketInsight && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Market Insight:</span>{' '}
                    {suggestions.marketInsight}
                  </p>
                </div>
              )}

              {/* Platform Prices */}
              <div className="space-y-3">
                {(['facebook', 'poshmark', 'squarespace', 'ebay'] as const).map((platform) => (
                  <div
                    key={platform}
                    className="rounded-lg border border-border p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{PLATFORM_LABELS[platform]}</span>
                      <span className="text-lg font-bold text-primary">
                        ${suggestions[platform].price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {suggestions[platform].reasoning}
                    </p>
                  </div>
                ))}
              </div>

              {/* Apply Button */}
              <Button
                type="button"
                onClick={applyPrices}
                className="w-full gap-2"
                disabled={applied}
              >
                {applied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Prices Applied
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Apply These Prices
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!suggestions && !loading && (
            <div className="text-center py-6 text-muted-foreground">
              <DollarSign className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">
                Enter your zip code and click "Get Prices" for AI-powered price suggestions
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceSuggestion;
