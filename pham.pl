use Ham::Locator;
my $m = new Ham::Locator;
$m->set_loc('FN43rq');
my ($latitude, $longitude) = $m->loc2latlng;
print $latitude, $longitude
