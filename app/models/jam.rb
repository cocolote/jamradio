class Jam < ActiveRecord::Base
  has_many :guests
  has_many :jam_songs
  has_many :songs, through: :jam_songs
  belongs_to :user

  validates :user,
    presence: true,
  uniqueness: { scope: :name }

  validates :name,
    presence: true
end
