import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  TrendingUp,
  Eye,
  Target,
  Globe,
  BarChart3,
  FileText,
  Settings,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  Brain,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEOManager } from '@shared/seo';
import type { SEOReport, KeywordResearch, ContentAnalysis } from '@shared/types/seo';

const AdminSEO = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [seoData, setSeoData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<KeywordResearch[]>([]);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [seoReports, setSeoReports] = useState<SEOReport[]>([]);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockSEOData = {
    overview: {
      totalPages: 24,
      indexedPages: 22,
      averageScore: 87,
      totalKeywords: 156,
      organicTraffic: 12450,
      monthlyGrowth: 15.8
    },
    topKeywords: [
      { keyword: 'engineering services kenya', position: 3, volume: 1200, difficulty: 65 },
      { keyword: 'architectural design nairobi', position: 7, volume: 800, difficulty: 58 },
      { keyword: 'structural engineering', position: 12, volume: 2200, difficulty: 72 },
      { keyword: 'MEP systems design', position: 5, volume: 450, difficulty: 48 }
    ],
    pages: [
      { url: '/', title: 'Home', score: 92, issues: 1, traffic: 3200 },
      { url: '/services', title: 'Services', score: 89, issues: 2, traffic: 2800 },
      { url: '/portfolio', title: 'Portfolio', score: 85, issues: 3, traffic: 1900 },
      { url: '/about', title: 'About', score: 88, issues: 1, traffic: 1200 }
    ]
  };

  const mockKeywords: KeywordResearch[] = [
    {
      keyword: 'engineering consultancy kenya',
      searchVolume: 1500,
      difficulty: 62,
      cpc: 2.45,
      competition: 'medium',
      intent: 'commercial',
      relatedKeywords: ['civil engineering kenya', 'structural design services'],
      questions: ['What is engineering consultancy?', 'Best engineering firms in Kenya']
    },
    {
      keyword: 'sustainable building design',
      searchVolume: 890,
      difficulty: 58,
      cpc: 3.20,
      competition: 'high',
      intent: 'informational',
      relatedKeywords: ['green building certification', 'LEED design'],
      questions: ['How to design sustainable buildings?', 'Benefits of green building']
    }
  ];

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSeoData(mockSEOData);
      setKeywords(mockKeywords);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load SEO data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSitemap = async () => {
    setLoading(true);
    try {
      const pages = [
        { url: '/', priority: 1.0, changefreq: 'weekly' as const },
        { url: '/services', priority: 0.9, changefreq: 'weekly' as const },
        { url: '/portfolio', priority: 0.8, changefreq: 'monthly' as const },
        { url: '/about', priority: 0.7, changefreq: 'monthly' as const },
        { url: '/contact', priority: 0.8, changefreq: 'monthly' as const }
      ];
      
      const sitemap = SEOManager.generateSitemap(pages);
      
      // In a real app, this would save to the server
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      
      toast({
        title: "Success",
        description: "Sitemap generated and downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sitemap",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRobotsTxt = async () => {
    try {
      const robotsTxt = SEOManager.generateRobotsTxt();
      
      const blob = new Blob([robotsTxt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'robots.txt';
      a.click();
      
      toast({
        title: "Success",
        description: "Robots.txt generated and downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate robots.txt",
        variant: "destructive",
      });
    }
  };

  const analyzeContent = async (content: string) => {
    setLoading(true);
    try {
      // Mock content analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis: ContentAnalysis = {
        keywordDensity: {
          'engineering': 2.3,
          'services': 1.8,
          'kenya': 1.5,
          'design': 1.2
        },
        readabilityScore: 78,
        sentimentScore: 0.8,
        topicRelevance: 85,
        uniquenessScore: 92,
        suggestions: [
          'Increase keyword density for "structural engineering"',
          'Add more subheadings to improve readability',
          'Include more local Kenya references',
          'Add FAQ section for better user engagement'
        ]
      };
      
      setContentAnalysis(analysis);
      
      toast({
        title: "Analysis Complete",
        description: "Content analysis has been completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLLMContent = async (topic: string, keywords: string[]) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const content = SEOManager.generateLLMOptimizedContent(topic, keywords);
      
      // Create and download the content
      const contentText = `Title: ${content.title}

Description: ${content.description}

Headings:
${content.headings.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Content:
${content.content}`;

      const blob = new Blob([contentText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${topic.toLowerCase().replace(/\s+/g, '-')}-content.txt`;
      a.click();
      
      toast({
        title: "Content Generated",
        description: "LLM-optimized content has been generated and downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !seoData.overview) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Management</h1>
          <p className="text-gray-600 mt-1">Advanced SEO tools and analytics for better search visibility</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={generateRobotsTxt}>
            <Download className="h-4 w-4 mr-2" />
            Robots.txt
          </Button>
          <Button variant="outline" size="sm" onClick={generateSitemap} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Sitemap
          </Button>
          <Button size="sm" onClick={fetchSEOData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SEO Score</p>
                <p className="text-2xl font-bold text-green-600">{seoData.overview?.averageScore || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organic Traffic</p>
                <p className="text-2xl font-bold text-blue-600">{seoData.overview?.organicTraffic?.toLocaleString() || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{seoData.overview?.monthlyGrowth || 0}% this month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Indexed Pages</p>
                <p className="text-2xl font-bold text-purple-600">{seoData.overview?.indexedPages || 0}</p>
                <p className="text-xs text-gray-600 mt-1">
                  of {seoData.overview?.totalPages || 0} total pages
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Keywords</p>
                <p className="text-2xl font-bold text-orange-600">{seoData.overview?.totalKeywords || 0}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Ranking keywords
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="content">Content AI</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Top Performing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seoData.topKeywords?.map((keyword: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{keyword.keyword}</p>
                        <p className="text-xs text-gray-600">Volume: {keyword.volume.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{keyword.position}</Badge>
                        <Badge variant={keyword.difficulty > 60 ? 'destructive' : 'default'}>
                          {keyword.difficulty}% diff
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Page Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Page Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seoData.pages?.map((page: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{page.title}</p>
                          <p className="text-xs text-gray-600">{page.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{page.score}/100</span>
                          {page.issues > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {page.issues} issues
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={page.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Research & Analysis</CardTitle>
              <CardDescription>
                Discover new keyword opportunities and analyze existing rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter keywords to research..."
                    className="flex-1"
                  />
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Research
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {keywords.map((keyword, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{keyword.keyword}</h4>
                            <Badge variant={keyword.competition === 'high' ? 'destructive' : 
                                          keyword.competition === 'medium' ? 'default' : 'secondary'}>
                              {keyword.competition}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Volume</p>
                              <p className="font-medium">{keyword.searchVolume.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Difficulty</p>
                              <p className="font-medium">{keyword.difficulty}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">CPC</p>
                              <p className="font-medium">${keyword.cpc}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Related Keywords:</p>
                            <div className="flex flex-wrap gap-1">
                              {keyword.relatedKeywords.map((related, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {related}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Content Generation
              </CardTitle>
              <CardDescription>
                Generate SEO-optimized content using advanced LLM technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content Topic</label>
                      <Input placeholder="e.g., Structural Engineering Services" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Target Keywords</label>
                      <Textarea 
                        placeholder="Enter keywords separated by commas..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={() => generateLLMContent('Structural Engineering', ['structural engineering', 'building design'])} disabled={loading}>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Content
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Analyze Existing Content</label>
                      <Textarea 
                        placeholder="Paste your content here for analysis..."
                        rows={6}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => analyzeContent('sample content')}
                      disabled={loading}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Analyze Content
                    </Button>
                  </div>
                </div>

                {contentAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Content Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{contentAnalysis.readabilityScore}</div>
                          <div className="text-sm text-gray-600">Readability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{contentAnalysis.topicRelevance}%</div>
                          <div className="text-sm text-gray-600">Relevance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{contentAnalysis.uniquenessScore}%</div>
                          <div className="text-sm text-gray-600">Uniqueness</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{(contentAnalysis.sentimentScore * 100).toFixed(0)}%</div>
                          <div className="text-sm text-gray-600">Sentiment</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Keyword Density</h4>
                          <div className="space-y-2">
                            {Object.entries(contentAnalysis.keywordDensity).map(([keyword, density]) => (
                              <div key={keyword} className="flex justify-between items-center">
                                <span className="text-sm">{keyword}</span>
                                <span className="text-sm font-medium">{density}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Suggestions</h4>
                          <div className="space-y-2">
                            {contentAnalysis.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Technical SEO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">SSL Certificate</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Mobile Friendly</span>
                    </div>
                    <Badge variant="default">Optimized</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Page Speed</span>
                    </div>
                    <Badge variant="secondary">Needs Work</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Structured Data</span>
                    </div>
                    <Badge variant="default">Implemented</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={generateSitemap}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Sitemap.xml
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={generateRobotsTxt}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Robots.txt
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Custom Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Configuration</CardTitle>
              <CardDescription>
                Manage global SEO settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Default Title Template</label>
                      <Input defaultValue="%s | AKIBEKS Engineering Solutions" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Default Description</label>
                      <Textarea 
                        rows={3}
                        defaultValue="Leading engineering consultancy in Kenya providing architectural design, structural engineering, MEP systems, and project management services."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Default Keywords</label>
                      <Textarea 
                        rows={3}
                        defaultValue="engineering services kenya, architectural design nairobi, structural engineering, MEP systems design"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Social Media Handles</label>
                      <Input defaultValue="@AkibeksKE" placeholder="Twitter handle" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;