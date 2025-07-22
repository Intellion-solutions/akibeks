import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  BarChart3, 
  Settings, 
  Globe, 
  Eye, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  Download,
  RefreshCw,
  Zap,
  Target,
  FileText,
  Image,
  Link,
  Clock,
  Users,
  ChevronRight,
  Edit,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { seoManager, SEOConfig, SEOAnalysis } from '@/lib/seo-manager';
import { sitemapGenerator } from '@/lib/sitemap-generator';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface SEOPage {
  id: string;
  path: string;
  title: string;
  lastAnalyzed: string;
  score: number;
  issues: number;
  status: 'optimized' | 'needs-attention' | 'critical';
}

const AdminSEO: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pages, setPages] = useState<SEOPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<SEOPage | null>(null);
  const [seoConfig, setSeoConfig] = useState<Partial<SEOConfig>>({});
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false);
  const [sitemapStatus, setSitemapStatus] = useState<string>('');
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    // Mock data - in real implementation, fetch from database
    const mockPages: SEOPage[] = [
      { id: '/', path: '/', title: 'Homepage', lastAnalyzed: '2024-01-20', score: 95, issues: 1, status: 'optimized' },
      { id: '/about', path: '/about', title: 'About Us', lastAnalyzed: '2024-01-19', score: 78, issues: 3, status: 'needs-attention' },
      { id: '/services', path: '/services', title: 'Services', lastAnalyzed: '2024-01-18', score: 85, issues: 2, status: 'optimized' },
      { id: '/projects', path: '/projects', title: 'Projects', lastAnalyzed: '2024-01-17', score: 92, issues: 1, status: 'optimized' },
      { id: '/contact', path: '/contact', title: 'Contact', lastAnalyzed: '2024-01-16', score: 65, issues: 5, status: 'critical' },
      { id: '/blog', path: '/blog', title: 'Blog', lastAnalyzed: '2024-01-15', score: 88, issues: 2, status: 'optimized' }
    ];
    setPages(mockPages);
  };

  const analyzePage = async (pageId: string) => {
    setIsAnalyzing(true);
    try {
      const pageAnalysis = await seoManager.analyzePage();
      setAnalysis(pageAnalysis);
      
      toast({
        title: "Analysis Complete",
        description: `Page analyzed with SEO score: ${pageAnalysis.score}/100`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze page SEO",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveSEOConfig = async () => {
    if (!selectedPage) return;

    try {
      await seoManager.saveSEOConfig(selectedPage.id, seoConfig as SEOConfig);
      toast({
        title: "SEO Configuration Saved",
        description: "Page SEO settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save SEO configuration",
        variant: "destructive",
      });
    }
  };

  const loadSEOConfig = async (pageId: string) => {
    try {
      const config = await seoManager.loadSEOConfig(pageId);
      if (config) {
        setSeoConfig(config);
      } else {
        // Set default config
        setSeoConfig({
          title: '',
          description: '',
          keywords: [],
          robots: 'index, follow'
        });
      }
    } catch (error) {
      console.error('Failed to load SEO config:', error);
    }
  };

  const generateSitemap = async (type: string) => {
    setIsGeneratingSitemap(true);
    setSitemapStatus(`Generating ${type} sitemap...`);

    try {
      let sitemap: string;
      
      switch (type) {
        case 'main':
          sitemap = await sitemapGenerator.generateMainSitemap();
          break;
        case 'blog':
          sitemap = await sitemapGenerator.generateBlogSitemap();
          break;
        case 'news':
          sitemap = await sitemapGenerator.generateNewsSitemap();
          break;
        case 'index':
          sitemap = await sitemapGenerator.generateSitemapIndex();
          break;
        default:
          throw new Error('Unknown sitemap type');
      }

      // Save to database
      await sitemapGenerator.saveSitemapToDatabase(type, sitemap);
      
      // Create download link
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sitemap-${type}.xml`;
      a.click();
      URL.revokeObjectURL(url);

      setSitemapStatus(`${type} sitemap generated successfully!`);
      toast({
        title: "Sitemap Generated",
        description: `${type} sitemap has been created and downloaded.`,
      });
    } catch (error) {
      setSitemapStatus(`Failed to generate ${type} sitemap`);
      toast({
        title: "Generation Failed",
        description: `Failed to generate ${type} sitemap`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSitemap(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'optimized': 'default',
      'needs-attention': 'secondary',
      'critical': 'destructive'
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="SEO Management"
        description="Optimize your website's search engine performance with comprehensive SEO tools and analytics."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="sitemaps">Sitemaps</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall SEO Score</CardTitle>
                <Target className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">84</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
                <Progress value={84} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pages Optimized</CardTitle>
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18/25</div>
                <p className="text-xs text-muted-foreground">
                  72% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground">
                  Needs immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Indexed Pages</CardTitle>
                <Globe className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground">
                  Last updated 2 hours ago
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  SEO Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Organic Traffic</span>
                    <span className="text-sm text-green-600">+15.3%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Keyword Rankings</span>
                    <span className="text-sm text-green-600">+8.7%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Page Load Speed</span>
                    <span className="text-sm text-yellow-600">-2.1%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Missing meta descriptions</p>
                      <p className="text-xs text-gray-600">3 pages affected</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Large image files</p>
                      <p className="text-xs text-gray-600">5 images need optimization</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Eye className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Alt text missing</p>
                      <p className="text-xs text-gray-600">2 images without alt text</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search pages..."
                className="w-64"
                prefix={<Search className="w-4 h-4" />}
              />
              <Button variant="outline" onClick={() => analyzePage('all')}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyze All
              </Button>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>SEO Score</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Analyzed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.path}</TableCell>
                    <TableCell>{page.title}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${getScoreColor(page.score)}`}>
                        {page.score}/100
                      </span>
                    </TableCell>
                    <TableCell>
                      {page.issues > 0 ? (
                        <Badge variant="destructive">{page.issues}</Badge>
                      ) : (
                        <Badge variant="default">0</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(page.status)}</TableCell>
                    <TableCell>{page.lastAnalyzed}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPage(page);
                            loadSEOConfig(page.id);
                            setEditingPage(page.id);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => analyzePage(page.id)}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {editingPage && selectedPage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Edit SEO Configuration - {selectedPage.path}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={seoConfig.title || ''}
                      onChange={(e) => setSeoConfig({...seoConfig, title: e.target.value})}
                      placeholder="Enter page title..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Length: {(seoConfig.title || '').length}/60 characters
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="robots">Robots</Label>
                    <Input
                      id="robots"
                      value={seoConfig.robots || 'index, follow'}
                      onChange={(e) => setSeoConfig({...seoConfig, robots: e.target.value})}
                      placeholder="index, follow"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Meta Description</Label>
                  <Textarea
                    id="description"
                    value={seoConfig.description || ''}
                    onChange={(e) => setSeoConfig({...seoConfig, description: e.target.value})}
                    placeholder="Enter meta description..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Length: {(seoConfig.description || '').length}/160 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={seoConfig.keywords?.join(', ') || ''}
                    onChange={(e) => setSeoConfig({
                      ...seoConfig, 
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div>
                  <Label htmlFor="canonical">Canonical URL</Label>
                  <Input
                    id="canonical"
                    value={seoConfig.canonicalUrl || ''}
                    onChange={(e) => setSeoConfig({...seoConfig, canonicalUrl: e.target.value})}
                    placeholder="https://example.com/page"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingPage(null)}>
                    Cancel
                  </Button>
                  <Button onClick={saveSEOConfig}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">SEO Analysis</h3>
            <Button onClick={() => analyzePage('current')} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Current Page'}
            </Button>
          </div>

          {analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    SEO Score: {analysis.score}/100
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={analysis.score} className="mb-4" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Title Optimization</span>
                      <Badge variant={analysis.title.isOptimal ? "default" : "destructive"}>
                        {analysis.title.isOptimal ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Description Optimization</span>
                      <Badge variant={analysis.description.isOptimal ? "default" : "destructive"}>
                        {analysis.description.isOptimal ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Heading Structure</span>
                      <Badge variant={analysis.headings.h1Count === 1 ? "default" : "destructive"}>
                        H1: {analysis.headings.h1Count}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Images with Alt Text</span>
                      <Badge variant={analysis.images.imagesWithoutAlt === 0 ? "default" : "destructive"}>
                        {analysis.images.totalImages - analysis.images.imagesWithoutAlt}/{analysis.images.totalImages}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Structured Data</span>
                      <Badge variant={analysis.structuredData.hasStructuredData ? "default" : "destructive"}>
                        {analysis.structuredData.hasStructuredData ? "Present" : "Missing"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.title.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))}
                    
                    {analysis.description.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))}
                    
                    {analysis.headings.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))}
                    
                    {analysis.images.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))}
                    
                    {analysis.structuredData.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sitemaps" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Main Sitemap</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateSitemap('main')}
                  disabled={isGeneratingSitemap}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Blog Sitemap</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateSitemap('blog')}
                  disabled={isGeneratingSitemap}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">News Sitemap</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateSitemap('news')}
                  disabled={isGeneratingSitemap}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sitemap Index</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateSitemap('index')}
                  disabled={isGeneratingSitemap}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          </div>

          {sitemapStatus && (
            <Alert>
              <FileText className="w-4 h-4" />
              <AlertDescription>{sitemapStatus}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Robots.txt Generator</CardTitle>
              <CardDescription>
                Generate and download your robots.txt file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => {
                const robotsTxt = sitemapGenerator.generateRobotsTxt();
                const blob = new Blob([robotsTxt], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'robots.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download Robots.txt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Research</CardTitle>
                <CardDescription>
                  Analyze keyword performance and suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Open Keyword Tool
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Speed Analysis</CardTitle>
                <CardDescription>
                  Check page loading performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Analyze Speed
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>
                  Compare SEO performance with competitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Compare Sites
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schema Markup Generator</CardTitle>
                <CardDescription>
                  Create structured data for your pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Schema
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;