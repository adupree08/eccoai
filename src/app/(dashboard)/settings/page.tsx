"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  MessageSquare,
  Zap,
  Bell,
  X,
  Plus,
  Save,
  Sparkles,
  Check,
  Trash2,
  Star,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";

interface VoiceGuideline {
  id: string;
  category: string;
  guideline: string;
}

interface ExcludedTerm {
  id: string;
  term: string;
  reason?: string;
}

interface PreferredTerm {
  id: string;
  term: string;
  useInsteadOf: string;
}

interface VoiceSample {
  id: string;
  content: string;
}

interface BrandVoice {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  guidelines: VoiceGuideline[];
  excludedTerms: ExcludedTerm[];
  preferredTerms: PreferredTerm[];
  samples: VoiceSample[];
}

// Initial mock saved voices
const initialSavedVoices: BrandVoice[] = [
  {
    id: "1",
    name: "Professional Thought Leader",
    description: "Authoritative yet approachable voice for sharing industry insights",
    isDefault: true,
    guidelines: [
      { id: "1", category: "Tone", guideline: "Be conversational and approachable, not formal or corporate" },
      { id: "2", category: "Tone", guideline: "Use first-person perspective ('I', 'my') to build connection" },
      { id: "3", category: "Structure", guideline: "Start with a hook that grabs attention in the first line" },
      { id: "4", category: "Structure", guideline: "Use short paragraphs and plenty of white space" },
      { id: "5", category: "Content", guideline: "Share personal stories and real experiences" },
      { id: "6", category: "Content", guideline: "Provide actionable insights, not just theories" },
    ],
    excludedTerms: [
      { id: "1", term: "leverage", reason: "Too corporate" },
      { id: "2", term: "synergy", reason: "Overused buzzword" },
      { id: "3", term: "disrupt", reason: "Cliche" },
    ],
    preferredTerms: [
      { id: "1", term: "use", useInsteadOf: "leverage" },
      { id: "2", term: "collaboration", useInsteadOf: "synergy" },
    ],
    samples: [],
  },
];

const categories = ["Tone", "Structure", "Content", "Style"];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("brand-voice");
  const [savedVoices, setSavedVoices] = useState<BrandVoice[]>(initialSavedVoices);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>("1");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newVoiceName, setNewVoiceName] = useState("");
  const [newVoiceDescription, setNewVoiceDescription] = useState("");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Current voice being edited
  const currentVoice = savedVoices.find((v) => v.id === selectedVoiceId);

  const [guidelines, setGuidelines] = useState<VoiceGuideline[]>(currentVoice?.guidelines || []);
  const [excludedTerms, setExcludedTerms] = useState<ExcludedTerm[]>(currentVoice?.excludedTerms || []);
  const [preferredTerms, setPreferredTerms] = useState<PreferredTerm[]>(currentVoice?.preferredTerms || []);
  const [samples, setSamples] = useState<VoiceSample[]>(currentVoice?.samples || []);

  const [newGuideline, setNewGuideline] = useState({ category: "Tone", guideline: "" });
  const [newExcludedTerm, setNewExcludedTerm] = useState({ term: "", reason: "" });
  const [newPreferredTerm, setNewPreferredTerm] = useState({ term: "", useInsteadOf: "" });
  const [newSample, setNewSample] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSelectVoice = (voiceId: string) => {
    const voice = savedVoices.find((v) => v.id === voiceId);
    if (voice) {
      setSelectedVoiceId(voiceId);
      setGuidelines(voice.guidelines);
      setExcludedTerms(voice.excludedTerms);
      setPreferredTerms(voice.preferredTerms);
      setSamples(voice.samples);
      setIsCreatingNew(false);
    }
  };

  const handleCreateNewVoice = () => {
    setIsCreatingNew(true);
    setSelectedVoiceId(null);
    setNewVoiceName("");
    setNewVoiceDescription("");
    setGuidelines([]);
    setExcludedTerms([]);
    setPreferredTerms([]);
    setSamples([]);
  };

  const handleAddGuideline = () => {
    if (newGuideline.guideline.trim()) {
      setGuidelines([
        ...guidelines,
        { id: Date.now().toString(), ...newGuideline },
      ]);
      setNewGuideline({ category: "Tone", guideline: "" });
    }
  };

  const handleRemoveGuideline = (id: string) => {
    setGuidelines(guidelines.filter((g) => g.id !== id));
  };

  const handleAddExcludedTerm = () => {
    if (newExcludedTerm.term.trim()) {
      setExcludedTerms([
        ...excludedTerms,
        { id: Date.now().toString(), ...newExcludedTerm },
      ]);
      setNewExcludedTerm({ term: "", reason: "" });
    }
  };

  const handleRemoveExcludedTerm = (id: string) => {
    setExcludedTerms(excludedTerms.filter((t) => t.id !== id));
  };

  const handleAddPreferredTerm = () => {
    if (newPreferredTerm.term.trim() && newPreferredTerm.useInsteadOf.trim()) {
      setPreferredTerms([
        ...preferredTerms,
        { id: Date.now().toString(), ...newPreferredTerm },
      ]);
      setNewPreferredTerm({ term: "", useInsteadOf: "" });
    }
  };

  const handleRemovePreferredTerm = (id: string) => {
    setPreferredTerms(preferredTerms.filter((t) => t.id !== id));
  };

  const handleAddSample = () => {
    if (newSample.trim()) {
      setSamples([
        ...samples,
        { id: Date.now().toString(), content: newSample },
      ]);
      setNewSample("");
    }
  };

  const handleRemoveSample = (id: string) => {
    setSamples(samples.filter((s) => s.id !== id));
  };

  const handleSetDefault = (voiceId: string) => {
    setSavedVoices(savedVoices.map((v) => ({
      ...v,
      isDefault: v.id === voiceId,
    })));
  };

  const handleDeleteVoice = (voiceId: string) => {
    const voice = savedVoices.find((v) => v.id === voiceId);
    if (voice?.isDefault) return; // Can't delete default voice

    setSavedVoices(savedVoices.filter((v) => v.id !== voiceId));
    if (selectedVoiceId === voiceId) {
      const defaultVoice = savedVoices.find((v) => v.isDefault);
      if (defaultVoice) {
        handleSelectVoice(defaultVoice.id);
      }
    }
  };

  const handleSave = () => {
    setIsSaving(true);

    setTimeout(() => {
      if (isCreatingNew && newVoiceName.trim()) {
        // Create new voice
        const newVoice: BrandVoice = {
          id: Date.now().toString(),
          name: newVoiceName,
          description: newVoiceDescription,
          isDefault: savedVoices.length === 0,
          guidelines,
          excludedTerms,
          preferredTerms,
          samples,
        };
        setSavedVoices([...savedVoices, newVoice]);
        setSelectedVoiceId(newVoice.id);
        setIsCreatingNew(false);
      } else if (selectedVoiceId) {
        // Update existing voice
        setSavedVoices(savedVoices.map((v) =>
          v.id === selectedVoiceId
            ? { ...v, guidelines, excludedTerms, preferredTerms, samples }
            : v
        ));
      }

      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
            Settings
          </h1>
          <p className="text-sm text-ecco-tertiary">
            Configure your account and brand voice
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || (isCreatingNew && !newVoiceName.trim())}
          className="bg-ecco-navy hover:bg-ecco-navy-light"
        >
          {isSaving ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : showSaved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isCreatingNew ? "Save New Voice" : "Save Changes"}
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-ecco p-1 h-auto">
          <TabsTrigger
            value="brand-voice"
            className="data-[state=active]:bg-ecco-navy data-[state=active]:text-white px-5 py-2.5"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Brand Voice
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="data-[state=active]:bg-ecco-navy data-[state=active]:text-white px-5 py-2.5"
          >
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-ecco-navy data-[state=active]:text-white px-5 py-2.5"
          >
            <Zap className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-ecco-navy data-[state=active]:text-white px-5 py-2.5"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Brand Voice Tab */}
        <TabsContent value="brand-voice" className="space-y-6 mt-6">
          {/* Saved Voice Profiles */}
          <Card className="border-ecco">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-ecco-primary">
                    Your Brand Voices
                  </CardTitle>
                  <p className="text-sm text-ecco-tertiary">
                    Create and manage different voice profiles for your content
                  </p>
                </div>
                <Button
                  onClick={handleCreateNewVoice}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Voice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {savedVoices.map((voice) => (
                  <div
                    key={voice.id}
                    onClick={() => handleSelectVoice(voice.id)}
                    className={cn(
                      "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedVoiceId === voice.id && !isCreatingNew
                        ? "border-ecco-navy bg-ecco-accent-light"
                        : "border-ecco hover:border-ecco-navy"
                    )}
                  >
                    {voice.isDefault && (
                      <div className="absolute -top-2 -right-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-ecco-navy">
                          <Star className="h-3 w-3 text-white fill-white" />
                        </div>
                      </div>
                    )}
                    <h3 className="font-semibold text-ecco-primary mb-1">
                      {voice.name}
                    </h3>
                    <p className="text-xs text-ecco-tertiary line-clamp-2 mb-3">
                      {voice.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-ecco-muted">
                      <span>{voice.guidelines.length} guidelines</span>
                      <span>•</span>
                      <span>{voice.excludedTerms.length} excluded terms</span>
                    </div>
                    {!voice.isDefault && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-ecco-light">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(voice.id);
                          }}
                        >
                          <Star className="mr-1 h-3 w-3" />
                          Set Default
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-ecco-error hover:text-ecco-error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVoice(voice.id);
                          }}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Create New Card */}
                <div
                  onClick={handleCreateNewVoice}
                  className={cn(
                    "p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px]",
                    isCreatingNew
                      ? "border-ecco-navy bg-ecco-accent-light"
                      : "border-ecco hover:border-ecco-navy"
                  )}
                >
                  <Plus className="h-6 w-6 text-ecco-muted mb-2" />
                  <span className="text-sm font-medium text-ecco-tertiary">
                    Create New Voice
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Name & Description (for new voices) */}
          {isCreatingNew && (
            <Card className="border-ecco border-2 border-ecco-navy">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-ecco-primary">
                  New Brand Voice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-ecco-secondary mb-2 block">
                    Voice Name *
                  </label>
                  <Input
                    placeholder="e.g., Professional Thought Leader"
                    value={newVoiceName}
                    onChange={(e) => setNewVoiceName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ecco-secondary mb-2 block">
                    Description
                  </label>
                  <Input
                    placeholder="Brief description of when to use this voice..."
                    value={newVoiceDescription}
                    onChange={(e) => setNewVoiceDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Voice Guidelines */}
          {(selectedVoiceId || isCreatingNew) && (
            <>
              <Card className="border-ecco">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-ecco-primary">
                    Voice Guidelines
                  </CardTitle>
                  <p className="text-sm text-ecco-tertiary">
                    Define how your content should sound. These guidelines help AI generate posts that echo your unique voice.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Guidelines by Category */}
                  {categories.map((category) => {
                    const categoryGuidelines = guidelines.filter(
                      (g) => g.category === category
                    );
                    if (categoryGuidelines.length === 0) return null;

                    return (
                      <div key={category} className="space-y-2">
                        <p className="text-xs font-semibold text-ecco-muted uppercase tracking-wide">
                          {category}
                        </p>
                        <div className="space-y-2">
                          {categoryGuidelines.map((g) => (
                            <div
                              key={g.id}
                              className="flex items-start gap-3 p-3 bg-ecco-off-white rounded-lg group"
                            >
                              <p className="flex-1 text-sm text-ecco-primary">
                                {g.guideline}
                              </p>
                              <button
                                onClick={() => handleRemoveGuideline(g.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white transition-opacity"
                              >
                                <X className="h-4 w-4 text-ecco-muted hover:text-ecco-error" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {guidelines.length === 0 && (
                    <p className="text-sm text-ecco-muted text-center py-4">
                      No guidelines yet. Add your first guideline below.
                    </p>
                  )}

                  {/* Add New Guideline */}
                  <div className="pt-4 border-t border-ecco-light">
                    <div className="flex gap-3">
                      <select
                        value={newGuideline.category}
                        onChange={(e) =>
                          setNewGuideline({ ...newGuideline, category: e.target.value })
                        }
                        className="w-32 px-3 py-2 text-sm border border-ecco rounded-lg bg-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="Add a new voice guideline..."
                        value={newGuideline.guideline}
                        onChange={(e) =>
                          setNewGuideline({ ...newGuideline, guideline: e.target.value })
                        }
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleAddGuideline()}
                      />
                      <Button
                        onClick={handleAddGuideline}
                        className="bg-ecco-navy hover:bg-ecco-navy-light"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Excluded Terms */}
              <Card className="border-ecco">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-ecco-primary">
                    Excluded Terms
                  </CardTitle>
                  <p className="text-sm text-ecco-tertiary">
                    Words or phrases that should never appear in your content.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {excludedTerms.map((term) => (
                      <Badge
                        key={term.id}
                        variant="secondary"
                        className="py-1.5 pl-3 pr-2 bg-red-50 text-red-700 border-0"
                      >
                        {term.term}
                        {term.reason && (
                          <span className="ml-1 text-red-400">({term.reason})</span>
                        )}
                        <button
                          onClick={() => handleRemoveExcludedTerm(term.id)}
                          className="ml-2 p-0.5 rounded-full hover:bg-red-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {excludedTerms.length === 0 && (
                    <p className="text-sm text-ecco-muted text-center py-2">
                      No excluded terms yet.
                    </p>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-ecco-light">
                    <Input
                      placeholder="Term to exclude..."
                      value={newExcludedTerm.term}
                      onChange={(e) =>
                        setNewExcludedTerm({ ...newExcludedTerm, term: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Reason (optional)"
                      value={newExcludedTerm.reason}
                      onChange={(e) =>
                        setNewExcludedTerm({ ...newExcludedTerm, reason: e.target.value })
                      }
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleAddExcludedTerm()}
                    />
                    <Button
                      onClick={handleAddExcludedTerm}
                      className="bg-ecco-navy hover:bg-ecco-navy-light"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preferred Terms */}
              <Card className="border-ecco">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-ecco-primary">
                    Preferred Terms
                  </CardTitle>
                  <p className="text-sm text-ecco-tertiary">
                    Words or phrases you prefer to use instead of alternatives.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {preferredTerms.map((term) => (
                      <div
                        key={term.id}
                        className="flex items-center gap-3 p-3 bg-ecco-off-white rounded-lg group"
                      >
                        <span className="text-sm font-medium text-ecco-blue">
                          {term.term}
                        </span>
                        <span className="text-sm text-ecco-tertiary">instead of</span>
                        <span className="text-sm text-ecco-muted line-through">
                          {term.useInsteadOf}
                        </span>
                        <button
                          onClick={() => handleRemovePreferredTerm(term.id)}
                          className="opacity-0 group-hover:opacity-100 ml-auto p-1 rounded hover:bg-white transition-opacity"
                        >
                          <X className="h-4 w-4 text-ecco-muted hover:text-ecco-error" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {preferredTerms.length === 0 && (
                    <p className="text-sm text-ecco-muted text-center py-2">
                      No preferred terms yet.
                    </p>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-ecco-light">
                    <Input
                      placeholder="Preferred term..."
                      value={newPreferredTerm.term}
                      onChange={(e) =>
                        setNewPreferredTerm({ ...newPreferredTerm, term: e.target.value })
                      }
                      className="flex-1"
                    />
                    <span className="flex items-center text-sm text-ecco-tertiary">
                      instead of
                    </span>
                    <Input
                      placeholder="Alternative to avoid..."
                      value={newPreferredTerm.useInsteadOf}
                      onChange={(e) =>
                        setNewPreferredTerm({
                          ...newPreferredTerm,
                          useInsteadOf: e.target.value,
                        })
                      }
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleAddPreferredTerm()}
                    />
                    <Button
                      onClick={handleAddPreferredTerm}
                      className="bg-ecco-navy hover:bg-ecco-navy-light"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Content */}
              <Card className="border-ecco">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-ecco-primary">
                    Sample Content
                  </CardTitle>
                  <p className="text-sm text-ecco-tertiary">
                    Paste examples of content that represents your ideal voice. The AI will learn from these samples.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {samples.length > 0 && (
                    <div className="space-y-3">
                      {samples.map((sample) => (
                        <div
                          key={sample.id}
                          className="p-4 bg-ecco-off-white rounded-lg group relative"
                        >
                          <p className="text-sm text-ecco-primary whitespace-pre-wrap line-clamp-4">
                            {sample.content}
                          </p>
                          <button
                            onClick={() => handleRemoveSample(sample.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white transition-opacity"
                          >
                            <X className="h-4 w-4 text-ecco-muted hover:text-ecco-error" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Textarea
                    placeholder="Paste a sample LinkedIn post or piece of content that represents your voice..."
                    className="min-h-[150px]"
                    value={newSample}
                    onChange={(e) => setNewSample(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddSample}
                    disabled={!newSample.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sample
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6 mt-6">
          <Card className="border-ecco">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ecco-primary">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-ecco-secondary mb-2 block">
                    Full Name
                  </label>
                  <Input placeholder="Your name" defaultValue={user?.user_metadata?.full_name || ""} />
                </div>
                <div>
                  <label className="text-sm font-medium text-ecco-secondary mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-ecco-secondary mb-2 block">
                  LinkedIn Profile URL
                </label>
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </CardContent>
          </Card>

          {/* Logout Section */}
          <Card className="border-ecco border-red-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ecco-primary">
                Sign Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ecco-tertiary mb-4">
                Sign out of your eccoai account on this device.
              </p>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {isLoggingOut ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-ecco">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ecco-primary">
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-ecco-off-white rounded-lg">
                <div>
                  <p className="font-semibold text-ecco-primary">Free Plan</p>
                  <p className="text-sm text-ecco-tertiary">
                    10 AI-generated posts per month
                  </p>
                </div>
                <Button className="bg-ecco-navy hover:bg-ecco-navy-light">
                  Upgrade
                </Button>
              </div>
              <div className="mt-4">
                <p className="text-sm text-ecco-tertiary mb-2">Credits used</p>
                <div className="h-2 bg-ecco-off-white rounded-full overflow-hidden">
                  <div className="h-full w-3/10 bg-ecco-blue rounded-full"></div>
                </div>
                <p className="text-xs text-ecco-muted mt-2">3 of 10 posts used this month</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6 mt-6">
          <Card className="border-ecco">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ecco-primary">
                LinkedIn Connection
              </CardTitle>
              <p className="text-sm text-ecco-tertiary">
                Connect your LinkedIn account for direct posting (coming soon)
              </p>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled>
                Connect LinkedIn
              </Button>
              <p className="text-xs text-ecco-muted mt-2">
                This feature is coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="border-ecco">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ecco-primary">
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-ecco rounded-lg">
                <div>
                  <p className="font-medium text-ecco-primary">Weekly Digest</p>
                  <p className="text-sm text-ecco-tertiary">
                    Get a summary of your content performance
                  </p>
                </div>
                <input type="checkbox" className="accent-ecco-blue w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border border-ecco rounded-lg">
                <div>
                  <p className="font-medium text-ecco-primary">Scheduled Post Reminders</p>
                  <p className="text-sm text-ecco-tertiary">
                    Get notified before your posts go live
                  </p>
                </div>
                <input type="checkbox" className="accent-ecco-blue w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border border-ecco rounded-lg">
                <div>
                  <p className="font-medium text-ecco-primary">Product Updates</p>
                  <p className="text-sm text-ecco-tertiary">
                    Stay informed about new features
                  </p>
                </div>
                <input type="checkbox" className="accent-ecco-blue w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
